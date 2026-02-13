import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Post {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export function useFeedPosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["feed-posts", user?.id],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      const userIds = [...new Set((posts || []).map((p: any) => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, display_name, avatar_url, is_verified").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post: any) => {
          const [{ count: likesCount }, { count: commentsCount }, likeCheck] = await Promise.all([
            supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
            user ? supabase.from("likes").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle() : { data: null },
          ]);
          return {
            ...post,
            profiles: profileMap.get(post.user_id) || { username: "user", display_name: null, avatar_url: null, is_verified: false },
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            is_liked: !!likeCheck.data,
          };
        })
      );
      return postsWithCounts as unknown as Post[];
    },
    enabled: !!user,
  });
}

export function useUserPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, image_url, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ imageFile, caption }: { imageFile: File; caption: string }) => {
      if (!user) throw new Error("Not authenticated");
      const filePath = `${user.id}/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, imageFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("posts").getPublicUrl(filePath);
      const { error } = await supabase.from("posts").insert({ user_id: user.id, image_url: publicUrl, caption });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });
}
