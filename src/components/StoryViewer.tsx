import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { StoryGroup } from "@/hooks/use-stories";

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

const StoryViewer = ({ groups, initialGroupIndex, onClose }: StoryViewerProps) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const goNext = useCallback(() => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, groupIndex, group, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex(prev => prev - 1);
      setStoryIndex(0);
      setProgress(0);
    }
  }, [storyIndex, groupIndex]);

  // Auto-progress timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 50));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [goNext]);

  // Record view
  useEffect(() => {
    if (!story || !user) return;
    supabase.from("story_views").insert({ story_id: story.id, viewer_id: user.id }).then(() => {});
  }, [story?.id, user?.id]);

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2 pt-3">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-muted-foreground/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-100"
              style={{ width: i < storyIndex ? "100%" : i === storyIndex ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={group.avatar_url || "https://i.pravatar.cc/100"} alt="" className="w-8 h-8 rounded-full object-cover border border-primary" />
          <span className="text-sm font-semibold">{group.username}</span>
          {group.is_verified && <BadgeCheck size={14} className="text-primary" />}
        </div>
        <button onClick={onClose} className="p-1"><X size={24} /></button>
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center">
        {story.media_type === "video" ? (
          <video src={story.media_url} className="w-full h-full object-contain" autoPlay muted playsInline />
        ) : (
          <img src={story.media_url} alt="" className="w-full h-full object-contain" />
        )}
      </div>

      {/* Tap zones */}
      <button onClick={goPrev} className="absolute left-0 top-16 bottom-0 w-1/3 z-10" aria-label="Previous" />
      <button onClick={goNext} className="absolute right-0 top-16 bottom-0 w-1/3 z-10" aria-label="Next" />
    </div>
  );
};

export default StoryViewer;
