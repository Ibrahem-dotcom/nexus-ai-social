import { useState } from "react";
import { Heart, MessageCircle, Share2, Music } from "lucide-react";

const reelsData = [
  {
    username: "IbrahemAbood",
    avatar: "https://i.pravatar.cc/100?img=68",
    video: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=800&fit=crop",
    caption: "Witness the future of social ✨ #NEXUS",
    likes: "12.4K",
    comments: "843",
    music: "Original Sound - IbrahemAbood",
    verified: true,
  },
  {
    username: "luna_creative",
    avatar: "https://i.pravatar.cc/100?img=9",
    video: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=800&fit=crop",
    caption: "Morning vibes 🌅 #nature #peace",
    likes: "8.2K",
    comments: "231",
    music: "Chill Beats - LoFi",
  },
  {
    username: "tech_wizard",
    avatar: "https://i.pravatar.cc/100?img=11",
    video: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=800&fit=crop",
    caption: "Matrix vibes 💚 #code #hacker",
    likes: "5.7K",
    comments: "124",
    music: "Cyberpunk 2077 OST",
  },
];

const Reels = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());

  const toggleLike = (index: number) => {
    setLikedReels(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  return (
    <div className="h-screen bg-background overflow-hidden relative">
      <div
        className="h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${currentReel * 100}%)` }}
      >
        {reelsData.map((reel, i) => (
          <div key={i} className="h-screen relative">
            {/* Background Image (simulating video) */}
            <img
              src={reel.video}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />

            {/* Right actions */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
              <button onClick={() => toggleLike(i)} className="flex flex-col items-center gap-1">
                <Heart
                  size={28}
                  className={`${likedReels.has(i) ? "text-neon-pink fill-neon-pink" : "text-foreground"}`}
                />
                <span className="text-xs font-medium">{reel.likes}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <MessageCircle size={28} className="text-foreground" />
                <span className="text-xs font-medium">{reel.comments}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Share2 size={26} className="text-foreground" />
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-24 left-0 right-16 p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={reel.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-primary" />
                <span className="font-semibold text-sm">{reel.username}</span>
                {reel.verified && <span className="text-primary text-xs">✓</span>}
                <button className="ml-2 px-3 py-1 rounded-lg border border-primary text-primary text-xs font-medium">Follow</button>
              </div>
              <p className="text-sm mb-2">{reel.caption}</p>
              <div className="flex items-center gap-2">
                <Music size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{reel.music}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Swipe hint */}
      <div className="absolute top-6 left-0 right-0 flex justify-center z-10">
        <h2 className="text-lg font-display font-bold neon-text">Reels</h2>
      </div>

      {/* Swipe overlay for navigation */}
      <div
        className="absolute inset-0 z-10"
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const handleEnd = (ev: TouchEvent) => {
            const diff = startY - ev.changedTouches[0].clientY;
            if (diff > 50 && currentReel < reelsData.length - 1) setCurrentReel(prev => prev + 1);
            if (diff < -50 && currentReel > 0) setCurrentReel(prev => prev - 1);
            document.removeEventListener("touchend", handleEnd);
          };
          document.addEventListener("touchend", handleEnd);
        }}
        onClick={(e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          if (clickY > rect.height / 2 && currentReel < reelsData.length - 1) {
            setCurrentReel(prev => prev + 1);
          } else if (clickY <= rect.height / 2 && currentReel > 0) {
            setCurrentReel(prev => prev - 1);
          }
        }}
      />
    </div>
  );
};

export default Reels;
