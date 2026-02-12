import { useState } from "react";

interface StoryCircleProps {
  name: string;
  image: string;
  isOwn?: boolean;
  hasStory?: boolean;
}

const stories: StoryCircleProps[] = [
  { name: "You", image: "https://i.pravatar.cc/100?img=1", isOwn: true, hasStory: false },
  { name: "Sarah", image: "https://i.pravatar.cc/100?img=5", hasStory: true },
  { name: "Alex", image: "https://i.pravatar.cc/100?img=3", hasStory: true },
  { name: "Mike", image: "https://i.pravatar.cc/100?img=8", hasStory: true },
  { name: "Luna", image: "https://i.pravatar.cc/100?img=9", hasStory: true },
  { name: "Chris", image: "https://i.pravatar.cc/100?img=11", hasStory: true },
  { name: "Jade", image: "https://i.pravatar.cc/100?img=16", hasStory: true },
];

const StoriesBar = () => {
  return (
    <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
      {stories.map((story, i) => (
        <button key={i} className="flex flex-col items-center gap-1 min-w-fit">
          <div className={`p-0.5 rounded-full ${story.hasStory ? "gradient-primary" : story.isOwn ? "border-2 border-dashed border-muted-foreground" : "border-2 border-muted"}`}>
            <div className="w-16 h-16 rounded-full border-2 border-background overflow-hidden relative">
              <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
              {story.isOwn && (
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-background">+</div>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium truncate w-16 text-center">{story.name}</span>
        </button>
      ))}
    </div>
  );
};

export default StoriesBar;
