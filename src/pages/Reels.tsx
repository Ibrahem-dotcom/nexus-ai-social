import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, BadgeCheck } from "lucide-react";
import { useReels, useToggleReelLike } from "@/hooks/use-reels";
import { formatDistanceToNow } from "date-fns";

const Reels = () => {
  const { data: reels, isLoading, error } = useReels();
  const [currentReel, setCurrentReel] = useState(0);
  const [muted, setMuted] = useState(false);
  const toggleLike = useToggleReelLike();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !reels?.length) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-lg">No reels yet</p>
        <p className="text-muted-foreground text-sm">Upload the first reel!</p>
      </div>
    );
  }

  const reel = reels[currentReel];

  return (
    <div className="h-screen bg-background overflow-hidden relative">
      <div className="h-full transition-transform duration-500 ease-out" style={{ transform: `translateY(-${currentReel * 100}%)` }}>
        {reels.map((r, i) => (
          <div key={r.id} className="h-screen relative">
            <video
              ref={el => { videoRefs.current[i] = el; }}
              src={r.video_url}
              className="w-full h-full object-cover"
              loop
              muted={muted}
              playsInline
              autoPlay={i === currentReel}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />

            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6" style={{ zIndex: 10 }}>
              <button onClick={() => toggleLike.mutate({ reelId: r.id, isLiked: r.is_liked })} className="flex flex-col items-center gap-1">
                <Heart size={28} className={r.is_liked ? "text-neon-pink fill-neon-pink" : "text-foreground"} />
                <span className="text-xs font-medium">{r.likes_count}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <MessageCircle size={28} className="text-foreground" />
                <span className="text-xs font-medium">{r.comments_count}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Share2 size={26} className="text-foreground" />
                <span className="text-xs font-medium">Share</span>
              </button>
              <button onClick={() => setMuted(!muted)} className="flex flex-col items-center gap-1">
                {muted ? <VolumeX size={24} className="text-foreground" /> : <Volume2 size={24} className="text-foreground" />}
              </button>
            </div>

            <div className="absolute bottom-24 left-0 right-16 p-4" style={{ zIndex: 10 }}>
              <div className="flex items-center gap-2 mb-2">
                <img src={r.profiles.avatar_url || "https://i.pravatar.cc/100"} alt="" className="w-9 h-9 rounded-full border-2 border-primary" />
                <span className="font-semibold text-sm">{r.profiles.username}</span>
                {r.profiles.is_verified && <BadgeCheck size={14} className="text-primary" />}
                <button className="ml-2 px-3 py-1 rounded-lg border border-primary text-primary text-xs font-medium">Follow</button>
              </div>
              {r.caption && <p className="text-sm mb-2">{r.caption}</p>}
              {r.audio_name && (
                <div className="flex items-center gap-2">
                  <Music size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{r.audio_name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute top-6 left-0 right-0 flex justify-center z-10">
        <h2 className="text-lg font-display font-bold neon-text">Reels</h2>
      </div>

      <div
        className="absolute inset-0"
        style={{ zIndex: 5 }}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const handleEnd = (ev: TouchEvent) => {
            const diff = startY - ev.changedTouches[0].clientY;
            if (diff > 50 && currentReel < reels.length - 1) setCurrentReel(prev => prev + 1);
            if (diff < -50 && currentReel > 0) setCurrentReel(prev => prev - 1);
            document.removeEventListener("touchend", handleEnd);
          };
          document.addEventListener("touchend", handleEnd);
        }}
      />
    </div>
  );
};

export default Reels;
