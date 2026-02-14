import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck, Send } from "lucide-react";
import { useToggleLike } from "@/hooks/use-posts";
import { useComments, useAddComment } from "@/hooks/use-comments";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  image: string | null;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  verified?: boolean;
  is_liked: boolean;
}

const PostCard = ({ id, userId, username, avatar, image, caption, likes_count, comments_count, created_at, verified, is_liked }: PostCardProps) => {
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const toggleLike = useToggleLike();
  const { data: comments } = useComments(showComments ? id : null);
  const addComment = useAddComment();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLike = () => {
    toggleLike.mutate({ postId: id, isLiked: is_liked });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ postId: id, content: commentText.trim() });
      setCommentText("");
    } catch {}
  };

  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true });

  return (
    <article className="glass rounded-2xl overflow-hidden animate-slide-up mb-4">
      <div className="flex items-center justify-between p-3">
        <button onClick={() => navigate(`/user/${userId}`)} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-primary p-0.5">
            <img src={avatar || "https://i.pravatar.cc/100"} alt={username} className="w-full h-full rounded-full object-cover border-2 border-background" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{username}</span>
              {verified && <BadgeCheck size={14} className="text-primary" />}
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </button>
        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {image && (
        <div className="aspect-square bg-secondary">
          <img src={image} alt="Post" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="transition-transform active:scale-125" disabled={toggleLike.isPending}>
              <Heart size={24} className={`transition-colors ${is_liked ? "text-neon-pink fill-neon-pink" : "text-foreground"}`} />
            </button>
            <button onClick={() => setShowComments(!showComments)}>
              <MessageCircle size={24} className="text-foreground" />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${id}`); toast({ title: "Link copied!" }); }}><Share2 size={22} className="text-foreground" /></button>
          </div>
          <button onClick={() => setSaved(!saved)}>
            <Bookmark size={24} className={`transition-colors ${saved ? "text-primary fill-primary" : "text-foreground"}`} />
          </button>
        </div>
        <p className="text-sm font-semibold mb-1">{likes_count.toLocaleString()} likes</p>
        {caption && (
          <p className="text-sm">
            <span className="font-semibold">{username}</span>{" "}
            <span className="text-muted-foreground">{caption}</span>
          </p>
        )}
        {comments_count > 0 && !showComments && (
          <button onClick={() => setShowComments(true)} className="text-sm text-muted-foreground mt-1">
            View all {comments_count} comments
          </button>
        )}

        {showComments && (
          <div className="mt-3 space-y-2">
            {comments?.map((c) => (
              <div key={c.id} className="flex gap-2">
                <img src={c.profiles.avatar_url || "https://i.pravatar.cc/30"} alt="" className="w-6 h-6 rounded-full object-cover mt-0.5" />
                <p className="text-sm">
                  <span className="font-semibold">{c.profiles.username}</span>{" "}
                  <span className="text-muted-foreground">{c.content}</span>
                </p>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button onClick={handleAddComment} disabled={addComment.isPending || !commentText.trim()} className="text-primary disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
