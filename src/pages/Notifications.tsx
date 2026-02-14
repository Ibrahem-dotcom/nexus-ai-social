import { ArrowLeft, Heart, MessageCircle, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

const Notifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      const actorIds = [...new Set((data || []).filter((n: any) => n.actor_id).map((n: any) => n.actor_id))];
      if (!actorIds.length) return (data || []).map((n: any) => ({ ...n, actor: null }));

      const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", actorIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (data || []).map((n: any) => ({ ...n, actor: profileMap.get(n.actor_id) || null }));
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Mark all as read on mount
  if (notifications?.some((n: any) => !n.read)) {
    markRead.mutate();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4 flex items-center gap-3">
        <Link to="/" className="p-1"><ArrowLeft size={22} /></Link>
        <h1 className="text-lg font-display font-bold">Notifications</h1>
      </div>

      {isLoading && (
        <div className="px-4 py-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2"><div className="w-40 h-3 bg-muted rounded" /></div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No notifications</p>
        </div>
      )}

      <div className="px-4 py-2">
        {notifications?.map((n: any) => {
          const Icon = iconMap[n.type] || Heart;
          return (
            <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
              <img src={n.actor?.avatar_url || "https://i.pravatar.cc/100"} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{n.actor?.username || "Someone"}</span>{" "}
                  <span className="text-muted-foreground">
                    {n.type === "like" && "liked your post"}
                    {n.type === "comment" && "commented on your post"}
                    {n.type === "follow" && "started following you"}
                    {!["like", "comment", "follow"].includes(n.type) && n.type}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
              </div>
              <Icon size={16} className="text-primary flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
