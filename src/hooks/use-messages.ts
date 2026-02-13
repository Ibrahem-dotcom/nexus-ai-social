import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Conversation {
  id: string;
  updated_at: string;
  participant: {
    user_id: string;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  last_message: string | null;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: myParticipations, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      if (error) throw error;
      if (!myParticipations?.length) return [];

      const convIds = myParticipations.map((p: any) => p.conversation_id);

      const conversations: Conversation[] = [];
      for (const convId of convIds) {
        const { data: otherParticipants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convId)
          .neq("user_id", user.id)
          .limit(1);

        if (!otherParticipants?.length) continue;

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, is_verified")
          .eq("user_id", otherParticipants[0].user_id)
          .single();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (profile) {
          conversations.push({
            id: convId,
            updated_at: "",
            participant: profile,
            last_message: lastMsg?.content || null,
            unread_count: 0,
          });
        }
      }
      return conversations;
    },
    enabled: !!user,
  });
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        () => { queryClient.invalidateQueries({ queryKey: ["messages", conversationId] }); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data: conv, error: convError } = await supabase.from("conversations").insert({}).select().single();
      if (convError) throw convError;
      await supabase.from("conversation_participants").insert([
        { conversation_id: conv.id, user_id: user.id },
        { conversation_id: conv.id, user_id: targetUserId },
      ]);
      return conv.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
