import { useState } from "react";
import { Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const exploreImages = [
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=300&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=600&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=300&fit=crop",
];

const tags = ["Trending", "Tech", "Art", "Music", "Travel", "Food", "Gaming"];

const Explore = () => {
  const [activeTag, setActiveTag] = useState("Trending");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search */}
      <div className="sticky top-0 z-40 glass-strong p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search NEXUS..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        {/* Tags */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeTag === tag
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {exploreImages.map((img, i) => (
          <div
            key={i}
            className={`${i === 2 || i === 6 ? "row-span-2" : ""} aspect-square overflow-hidden bg-secondary`}
          >
            <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
