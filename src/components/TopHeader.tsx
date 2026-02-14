import nexusLogo from "@/assets/nexus-icon.jpg";
import { Bell, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TopHeader = () => {
  const { user } = useAuth();

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-glass-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <img src={nexusLogo} alt="NEXUS" className="w-8 h-8 rounded-lg" />
          <h1 className="text-xl font-display font-bold gradient-text">NEXUS</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <Heart size={20} className="text-muted-foreground" />
          </Link>
          <Link to="/notifications" className="p-2 rounded-xl hover:bg-secondary transition-colors relative">
            <Bell size={20} className="text-muted-foreground" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
