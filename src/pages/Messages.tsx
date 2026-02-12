import { Search, Edit } from "lucide-react";

const conversations = [
  { name: "Sarah Chen", avatar: "https://i.pravatar.cc/100?img=5", lastMsg: "That sounds amazing! 🔥", time: "2m", unread: 3, online: true },
  { name: "Alex Rivera", avatar: "https://i.pravatar.cc/100?img=3", lastMsg: "Check out this new feature", time: "15m", unread: 1, online: true },
  { name: "NEXUS Team", avatar: "https://i.pravatar.cc/100?img=68", lastMsg: "Welcome to the team channel", time: "1h", unread: 0, online: false, isGroup: true },
  { name: "Luna Park", avatar: "https://i.pravatar.cc/100?img=9", lastMsg: "See you tomorrow!", time: "3h", unread: 0, online: false },
  { name: "Mike Johnson", avatar: "https://i.pravatar.cc/100?img=8", lastMsg: "Sent a photo", time: "5h", unread: 0, online: true },
  { name: "Tech Creators", avatar: "https://i.pravatar.cc/100?img=11", lastMsg: "New project ideas 💡", time: "1d", unread: 12, online: false, isGroup: true },
];

const Messages = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
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
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Online now */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Online Now</p>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {conversations.filter(c => c.online).map((c, i) => (
            <button key={i} className="flex flex-col items-center gap-1 min-w-fit">
              <div className="relative">
                <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-full object-cover border-2 border-secondary" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
              </div>
              <span className="text-xs text-muted-foreground w-14 truncate text-center">{c.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="px-2">
        {conversations.map((conv, i) => (
          <button
            key={i}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
              {conv.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${conv.unread > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {conv.name}
                </span>
                <span className={`text-xs ${conv.unread > 0 ? "text-primary" : "text-muted-foreground"}`}>{conv.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-sm truncate ${conv.unread > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {conv.lastMsg}
                </p>
                {conv.unread > 0 && (
                  <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Messages;
