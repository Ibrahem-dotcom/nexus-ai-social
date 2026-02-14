import TopHeader from "@/components/TopHeader";
import StoriesBar from "@/components/StoriesBar";
import PostCard from "@/components/PostCard";
import { useFeedPosts } from "@/hooks/use-posts";

const Index = () => {
  const { data: posts, isLoading, error } = useFeedPosts();

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        <StoriesBar />
        <div className="px-3">
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <div className="w-24 h-3 bg-muted rounded" />
                      <div className="w-16 h-2 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="aspect-square bg-muted rounded-xl" />
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-center text-destructive py-8">Failed to load posts</p>}
          {!isLoading && !error && posts?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No posts yet</p>
              <p className="text-muted-foreground text-sm mt-1">Be the first to share something!</p>
            </div>
          )}
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              userId={post.user_id}
              username={post.profiles.username}
              avatar={post.profiles.avatar_url}
              image={post.image_url}
              caption={post.caption}
              likes_count={post.likes_count}
              comments_count={post.comments_count}
              created_at={post.created_at}
              verified={post.profiles.is_verified}
              is_liked={post.is_liked}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
