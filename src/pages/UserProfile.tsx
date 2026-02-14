import { Grid3X3, BadgeCheck, ArrowLeft, MessageCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStats, useToggleFollow } from "@/hooks/use-profile";
import { useUserPosts } from "@/hooks/use-posts";
import { useCreateConversation } from "@/hooks/use-messages";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = useProfileStats(userId);
  const { data: userPosts, isLoading: postsLoading } = useUserPosts(userId);
  const toggleFollow = useToggleFollow();
  const createConversation = useCreateConversation();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", userId, user?.id],
    queryFn: async () => {
      if (!user || !userId) return false;
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!userId,
  });

  const handleMessage = async () => {
    if (!userId) return;
    try {
      const convId = await createConversation.mutateAsync(userId);
      navigate(`/messages?conv=${convId}`);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">User not found</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm">Go back</button>
      </div>
    );
  }

  // If viewing own profile, redirect
  if (userId === user?.id) {
    navigate("/profile", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={22} /></button>
        <div className="flex items-center gap-1">
          <span className="text-lg font-display font-bold">@{profile.username}</span>
          {profile.is_verified && <BadgeCheck size={18} className="text-primary" />}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full gradient-primary p-0.5">
            <img src={profile.avatar_url || "https://i.pravatar.cc/200"} alt="" className="w-full h-full rounded-full object-cover border-2 border-background" />
          </div>
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.posts ?? 0}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.followers ?? 0}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.following ?? 0}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="font-semibold text-sm">{profile.display_name || profile.username}</h2>
          {profile.is_founder && <p className="text-xs text-primary font-medium">Founder</p>}
          {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => toggleFollow.mutate({ targetUserId: userId!, isFollowing: !!isFollowing })}
            disabled={toggleFollow.isPending}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${isFollowing ? "bg-secondary text-secondary-foreground" : "gradient-primary text-primary-foreground"}`}
          >
            {toggleFollow.isPending ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </button>
          <button onClick={handleMessage} className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-1">
            <MessageCircle size={16} /> Message
          </button>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button className="flex-1 py-3 flex items-center justify-center border-b-2 border-primary text-primary">
          <Grid3X3 size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {postsLoading && [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-muted animate-pulse" />)}
        {userPosts?.map(post => (
          <div key={post.id} className="aspect-square overflow-hidden bg-secondary">
            {post.image_url ? (
              <img src={post.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
            )}
          </div>
        ))}
        {!postsLoading && (!userPosts || userPosts.length === 0) && (
          <div className="col-span-3 py-16 text-center text-muted-foreground"><p>No posts yet</p></div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
