import TopHeader from "@/components/TopHeader";
import StoriesBar from "@/components/StoriesBar";
import PostCard from "@/components/PostCard";

const posts = [
  {
    username: "IbrahemAbood",
    avatar: "https://i.pravatar.cc/100?img=68",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop",
    caption: "Building the future with NEXUS 🚀 #tech #innovation",
    likes: 2847,
    comments: 156,
    timeAgo: "2h ago",
    verified: true,
  },
  {
    username: "sarah_designs",
    avatar: "https://i.pravatar.cc/100?img=5",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
    caption: "Nature's own masterpiece ✨ #photography #nature",
    likes: 1293,
    comments: 42,
    timeAgo: "4h ago",
  },
  {
    username: "alex_code",
    avatar: "https://i.pravatar.cc/100?img=3",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop",
    caption: "Late night coding vibes 💻🌙",
    likes: 892,
    comments: 28,
    timeAgo: "6h ago",
    verified: true,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        <StoriesBar />
        <div className="px-3">
          {posts.map((post, i) => (
            <PostCard key={i} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
