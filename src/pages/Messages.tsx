import { Search, Edit, Send, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useConversations, useMessages, useSendMessage } from "@/hooks/use-messages";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const { data: conversations, isLoading } = useConversations();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: messages } = useMessages(activeConvId);
  const sendMessage = useSendMessage();
  const [messageText, setMessageText] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeConvId) return;
    try {
      await sendMessage.mutateAsync({ conversationId: activeConvId, content: messageText.trim() });
      setMessageText("");
    } catch {}
  };

  const activeConv = conversations?.find(c => c.id === activeConvId);

  // Chat view
  if (activeConvId && activeConv) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-40 glass-strong p-4 flex items-center gap-3">
          <button onClick={() => setActiveConvId(null)} className="p-1">
            <ArrowLeft size={22} />
          </button>
          <img src={activeConv.participant.avatar_url || "https://i.pravatar.cc/100"} alt="" className="w-9 h-9 rounded-full object-cover" />
          <span className="font-semibold text-sm">{activeConv.participant.username}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
          {messages?.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender_id === user?.id ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 glass-strong p-4 safe-area-bottom">
          <div className="flex gap-2 max-w-lg mx-auto">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Message..."
              className="flex-1 h-10 px-4 rounded-full bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} disabled={sendMessage.isPending || !messageText.trim()} className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center disabled:opacity-50">
              <Send size={18} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-display font-bold">Messages</h1>
          <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <Edit size={20} className="text-primary" />
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {isLoading && (
        <div className="px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-3 bg-muted rounded" />
                <div className="w-40 h-2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!conversations || conversations.length === 0) && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No conversations yet</p>
          <p className="text-muted-foreground text-sm mt-1">Start messaging someone!</p>
        </div>
      )}

      <div className="px-2">
        {conversations?.filter(c => !searchTerm || c.participant.username.toLowerCase().includes(searchTerm.toLowerCase())).map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConvId(conv.id)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img src={conv.participant.avatar_url || "https://i.pravatar.cc/100"} alt={conv.participant.username} className="w-12 h-12 rounded-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-sm font-semibold text-foreground">{conv.participant.username}</span>
              <p className="text-sm text-muted-foreground truncate">{conv.last_message || "No messages yet"}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Messages;
