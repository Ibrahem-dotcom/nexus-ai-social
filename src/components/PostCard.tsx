import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";

interface PostCardProps {
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  verified?: boolean;
}

const PostCard = ({ username, avatar, image, caption, likes, comments, timeAgo, verified }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <article className="glass rounded-2xl overflow-hidden animate-slide-up mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-primary p-0.5">
            <img src={avatar} alt={username} className="w-full h-full rounded-full object-cover border-2 border-background" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{username}</span>
              {verified && <span className="text-primary text-xs">✓</span>}
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Image */}
      <div className="aspect-square bg-secondary">
        <img src={image} alt="Post" className="w-full h-full object-cover" />
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="transition-transform active:scale-125">
              <Heart
                size={24}
                className={`transition-colors ${liked ? "text-neon-pink fill-neon-pink" : "text-foreground"}`}
              />
            </button>
            <button><MessageCircle size={24} className="text-foreground" /></button>
            <button><Share2 size={22} className="text-foreground" /></button>
          </div>
          <button onClick={() => setSaved(!saved)}>
            <Bookmark size={24} className={`transition-colors ${saved ? "text-primary fill-primary" : "text-foreground"}`} />
          </button>
        </div>
        <p className="text-sm font-semibold mb-1">{likeCount.toLocaleString()} likes</p>
        <p className="text-sm">
          <span className="font-semibold">{username}</span>{" "}
          <span className="text-muted-foreground">{caption}</span>
        </p>
        {comments > 0 && (
          <button className="text-sm text-muted-foreground mt-1">
            View all {comments} comments
          </button>
        )}
      </div>
    </article>
  );
};

export default PostCard;
