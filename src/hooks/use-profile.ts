import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfileStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile-stats", userId],
    queryFn: async () => {
      const [{ count: postsCount }, { count: followersCount }, { count: followingCount }] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId!),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId!),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId!),
      ]);
      return {
        posts: postsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
      };
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: { username?: string; display_name?: string; bio?: string; avatar_url?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
    },
  });
}

export function useUploadAvatar() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      const filePath = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await updateProfile.mutateAsync({ avatar_url: publicUrl });
      return publicUrl;
    },
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
      }
    },
    onSuccess: (_, { targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
      queryClient.invalidateQueries({ queryKey: ["is-following", targetUserId] });
    },
  });
}
