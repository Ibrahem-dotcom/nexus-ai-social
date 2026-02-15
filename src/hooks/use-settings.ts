import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserSettings {
  private_account: boolean;
  notify_likes: boolean;
  notify_comments: boolean;
  notify_follows: boolean;
  notify_messages: boolean;
  who_can_comment: string;
  who_can_message: string;
}

const defaults: UserSettings = {
  private_account: false,
  notify_likes: true,
  notify_comments: true,
  notify_follows: true,
  notify_messages: true,
  who_can_comment: "everyone",
  who_can_message: "everyone",
};

export function useUserSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-settings", user?.id],
    queryFn: async () => {
      if (!user) return defaults;
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        // Create default settings
        const { data: created, error: createErr } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id })
          .select()
          .single();
        if (createErr) throw createErr;
        return created as unknown as UserSettings;
      }
      return data as unknown as UserSettings;
    },
    enabled: !!user,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });
}
