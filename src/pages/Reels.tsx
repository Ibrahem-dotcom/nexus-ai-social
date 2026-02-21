import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, BadgeCheck, Send } from "lucide-react";
import { useReels, useToggleReelLike } from "@/hooks/use-reels";
import { useToggleFollow } from "@/hooks/use-profile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { shareContent } from "@/lib/share";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAddComment } from "@/hooks/use-comments";

const Reels = () => {
  const { data: reels, isLoading, error } = useReels();
  const [currentReel, setCurrentReel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showComments, setShowComments] = useState<string | false>(false);
  const [commentText, setCommentText] = useState("");
  const toggleLike = useToggleReelLike();
  const toggleFollow = useToggleFollow();
  const addComment = useAddComment();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewedReels = useRef(new Set<string>());

  // Auto-play current, pause others
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === currentReel) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [currentReel, reels]);

  // Track view once per session
  useEffect(() => {
    if (!reels?.length) return;
    const reel = reels[currentReel];
    if (reel && !viewedReels.current.has(reel.id)) {
      viewedReels.current.add(reel.id);
    }
  }, [currentReel, reels]);

  const handleShare = async (reelId: string, username: string) => {
    const url = `${window.location.origin}/reel/${reelId}`;
    const result = await shareContent({ title: `Reel by ${username}`, text: "Check out this reel on NEXUS", url });
    if (result === "copied") toast({ title: "Link copied!" });
  };

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
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />

            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6" style={{ zIndex: 10 }}>
              <button onClick={() => toggleLike.mutate({ reelId: r.id, isLiked: r.is_liked })} className="flex flex-col items-center gap-1">
                <Heart size={28} className={r.is_liked ? "text-neon-pink fill-neon-pink" : "text-foreground"} />
                <span className="text-xs font-medium">{r.likes_count}</span>
              </button>
              <button onClick={() => { setShowComments(showComments === r.id ? false : r.id); setCommentText(""); }} className="flex flex-col items-center gap-1">
                <MessageCircle size={28} className="text-foreground" />
                <span className="text-xs font-medium">{r.comments_count}</span>
              </button>
              <button onClick={() => handleShare(r.id, r.profiles.username)} className="flex flex-col items-center gap-1">
                <Share2 size={26} className="text-foreground" />
                <span className="text-xs font-medium">Share</span>
              </button>
              <button onClick={() => setMuted(!muted)} className="flex flex-col items-center gap-1">
                {muted ? <VolumeX size={24} className="text-foreground" /> : <Volume2 size={24} className="text-foreground" />}
              </button>
            </div>

            <div className="absolute bottom-24 left-0 right-16 p-4" style={{ zIndex: 10 }}>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => navigate(`/user/${r.user_id}`)} className="flex items-center gap-2">
                  <img src={r.profiles.avatar_url || "https://i.pravatar.cc/100"} alt="" className="w-9 h-9 rounded-full border-2 border-primary" />
                  <span className="font-semibold text-sm">{r.profiles.username}</span>
                  {r.profiles.is_verified && <BadgeCheck size={14} className="text-primary" />}
                </button>
                {r.user_id !== user?.id && (
                  <ReelFollowButton userId={r.user_id} />
                )}
              </div>
              {r.caption && <p className="text-sm mb-2">{r.caption}</p>}
              {r.audio_name && (
                <div className="flex items-center gap-2">
                  <Music size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{r.audio_name}</span>
                </div>
              )}
            </div>

            {/* Comments overlay */}
            {showComments === r.id && (
              <ReelComments reelId={r.id} onClose={() => setShowComments(false)} />
            )}
          </div>
        ))}
      </div>

      <div className="absolute top-6 left-0 right-0 flex justify-center z-10">
        <h2 className="text-lg font-display font-bold neon-text">Reels</h2>
      </div>

      <div
        className="absolute inset-0"
        style={{ zIndex: 5 }}
        onWheel={(e) => {
          if (e.deltaY > 30 && currentReel < reels.length - 1) setCurrentReel(prev => prev + 1);
          if (e.deltaY < -30 && currentReel > 0) setCurrentReel(prev => prev - 1);
        }}
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

// Sub-component: Follow button with real DB state
const ReelFollowButton = ({ userId }: { userId: string }) => {
  const { user } = useAuth();
  const toggleFollow = useToggleFollow();
  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", userId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!userId,
  });

  return (
    <button
      onClick={() => toggleFollow.mutate({ targetUserId: userId, isFollowing: !!isFollowing })}
      disabled={toggleFollow.isPending}
      className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium ${isFollowing ? "bg-secondary text-secondary-foreground" : "border border-primary text-primary"}`}
    >
      {toggleFollow.isPending ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
};

// Sub-component: Reel comments drawer
const ReelComments = ({ reelId, onClose }: { reelId: string; onClose: () => void }) => {
  const [text, setText] = useState("");
  const { user } = useAuth();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["reel-comments", reelId],
    queryFn: async () => {
      const { data, error } = await supabase.from("reel_comments").select("*").eq("reel_id", reelId).order("created_at", { ascending: true });
      if (error) throw error;
      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds.length ? userIds : ["none"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((c: any) => ({ ...c, profile: profileMap.get(c.user_id) || { username: "user", avatar_url: null } }));
    },
  });

  const queryClient = useQueryClient();
  const handleSend = async () => {
    if (!text.trim() || !user) return;
    await supabase.from("reel_comments").insert({ reel_id: reelId, user_id: user.id, content: text.trim() });
    setText("");
    queryClient.invalidateQueries({ queryKey: ["reel-comments", reelId] });
    queryClient.invalidateQueries({ queryKey: ["reels"] });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-lg rounded-t-2xl max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="font-semibold text-sm">Comments</span>
        <button onClick={onClose} className="text-muted-foreground text-sm">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading && <p className="text-muted-foreground text-sm text-center">Loading...</p>}
        {comments?.map((c: any) => (
          <div key={c.id} className="flex gap-2">
            <img src={c.profile.avatar_url || "https://i.pravatar.cc/30"} alt="" className="w-7 h-7 rounded-full object-cover" />
            <div>
              <span className="text-xs font-semibold">{c.profile.username}</span>
              <p className="text-sm text-muted-foreground">{c.content}</p>
            </div>
          </div>
        ))}
        {!isLoading && (!comments || comments.length === 0) && <p className="text-muted-foreground text-sm text-center">No comments yet</p>}
      </div>
      <div className="flex gap-2 p-3 border-t border-border">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add comment..." className="flex-1 text-sm bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none" onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <button onClick={handleSend} disabled={!text.trim()} className="text-primary disabled:opacity-50"><Send size={18} /></button>
      </div>
    </div>
  );
};

export default Reels;
