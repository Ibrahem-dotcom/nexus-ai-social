import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  caption: string | null;
  audio_name: string | null;
  audio_url: string | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export function useReels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reels", user?.id],
    queryFn: async () => {
      const { data: reels, error } = await supabase
        .from("reels")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      const userIds = [...new Set((reels || []).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url, is_verified").in("user_id", userIds.length ? userIds : ["none"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      const withCounts = await Promise.all(
        (reels || []).map(async (reel: any) => {
          const [{ count: likesCount }, { count: commentsCount }, likeCheck] = await Promise.all([
            supabase.from("reel_likes").select("*", { count: "exact", head: true }).eq("reel_id", reel.id),
            supabase.from("reel_comments").select("*", { count: "exact", head: true }).eq("reel_id", reel.id),
            user ? supabase.from("reel_likes").select("id").eq("reel_id", reel.id).eq("user_id", user.id).maybeSingle() : { data: null },
          ]);
          return {
            ...reel,
            profiles: profileMap.get(reel.user_id) || { username: "user", avatar_url: null, is_verified: false },
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            is_liked: !!likeCheck.data,
          };
        })
      );
      return withCounts as unknown as Reel[];
    },
    enabled: !!user,
  });
}

export function useToggleReelLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ reelId, isLiked }: { reelId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isLiked) {
        await supabase.from("reel_likes").delete().eq("reel_id", reelId).eq("user_id", user.id);
      } else {
        await supabase.from("reel_likes").insert({ reel_id: reelId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
  });
}

export function useCreateReel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ videoFile, caption, audioName }: { videoFile: File; caption: string; audioName?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const filePath = `${user.id}/${Date.now()}-${videoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("reels").upload(filePath, videoFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("reels").getPublicUrl(filePath);
      const { error } = await supabase.from("reels").insert({
        user_id: user.id,
        video_url: publicUrl,
        caption,
        audio_name: audioName || "Original Sound",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
  });
}
