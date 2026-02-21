import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const tags = ["Trending", "Tech", "Art", "Music", "Travel", "Food", "Gaming"];

const Explore = () => {
  const [activeTag, setActiveTag] = useState("Trending");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["explore-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, image_url")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["search-users", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, is_verified, display_name")
        .ilike("username", `%${searchTerm}%`)
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length > 0,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search NEXUS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        {!searchTerm && (
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeTag === tag ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {searchTerm && searchResults && (
        <div className="px-4 py-2 space-y-1">
          {searchResults.map((u: any) => (
            <Link to={`/user/${u.user_id}`} key={u.user_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <img src={u.avatar_url || "https://i.pravatar.cc/100"} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold">{u.username}</p>
                {u.display_name && <p className="text-xs text-muted-foreground">{u.display_name}</p>}
              </div>
            </Link>
          ))}
          {searchResults.length === 0 && <p className="text-center text-muted-foreground py-4">No users found</p>}
        </div>
      )}

      {!searchTerm && (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {isLoading && (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse" />
              ))}
            </>
          )}
          {posts?.map((post: any, i: number) => (
            <Link
              to={`/`}
              state={{ scrollToPost: post.id }}
              key={post.id}
              className={`${i === 2 || i === 6 ? "row-span-2" : ""} aspect-square overflow-hidden bg-secondary`}
            >
              <img src={post.image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </Link>
          ))}
          {!isLoading && (!posts || posts.length === 0) && (
            <div className="col-span-3 py-16 text-center text-muted-foreground">
              <p>No posts to explore yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;
