import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

export interface StoryGroup {
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
  stories: Story[];
  hasUnviewed: boolean;
}

export function useStories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((s: any) => s.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url, is_verified").in("user_id", userIds.length ? userIds : ["none"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      const grouped = new Map<string, StoryGroup>();
      for (const story of (data || []) as any[]) {
        const prof = profileMap.get(story.user_id) || { username: "user", avatar_url: null, is_verified: false };
        if (!grouped.has(story.user_id)) {
          grouped.set(story.user_id, {
            user_id: story.user_id,
            username: prof.username,
            avatar_url: prof.avatar_url,
            is_verified: prof.is_verified,
            stories: [],
            hasUnviewed: true,
          });
        }
        grouped.get(story.user_id)!.stories.push({ ...story, profiles: prof });
      }
      return Array.from(grouped.values());
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ file, mediaType }: { file: File; mediaType: string }) => {
      if (!user) throw new Error("Not authenticated");
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("stories").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("stories").getPublicUrl(filePath);
      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: mediaType.startsWith("video") ? "video" : "image",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
