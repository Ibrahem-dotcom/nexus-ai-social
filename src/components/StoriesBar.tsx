import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStories, useCreateStory } from "@/hooks/use-stories";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StoryViewer from "@/components/StoryViewer";

const StoriesBar = () => {
  const { user, profile } = useAuth();
  const { data: storyGroups, isLoading } = useStories();
  const createStory = useCreateStory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleAddStory = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await createStory.mutateAsync({ file, mediaType: file.type });
      toast({ title: "Story uploaded!" });
    } catch (err: any) {
      toast({ title: err.message || "Failed to upload story", variant: "destructive" });
    }
    e.target.value = "";
  };

  const otherGroups = storyGroups?.filter(g => g.user_id !== user?.id) || [];
  const allViewableGroups = storyGroups || [];

  const openStory = (groupUserId: string) => {
    const idx = allViewableGroups.findIndex(g => g.user_id === groupUserId);
    if (idx >= 0) {
      setViewerIndex(idx);
      setViewerOpen(true);
    }
  };

  return (
    <>
      <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

        {/* Your story */}
        <button onClick={handleAddStory} className="flex flex-col items-center gap-1 min-w-fit">
          <div className="p-0.5 rounded-full border-2 border-dashed border-muted-foreground">
            <div className="w-16 h-16 rounded-full border-2 border-background overflow-hidden relative">
              <img
                src={profile?.avatar_url || "https://i.pravatar.cc/100?img=1"}
                alt="You"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-background">
                <Plus size={12} />
              </div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium truncate w-16 text-center">You</span>
        </button>

        {/* Other stories */}
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-fit animate-pulse">
                <div className="w-[68px] h-[68px] rounded-full bg-muted" />
                <div className="w-12 h-3 rounded bg-muted" />
              </div>
            ))}
          </>
        )}

        {otherGroups.map((group) => (
          <button key={group.user_id} onClick={() => openStory(group.user_id)} className="flex flex-col items-center gap-1 min-w-fit">
            <div className={`p-0.5 rounded-full ${group.hasUnviewed ? "gradient-primary" : "border-2 border-muted"}`}>
              <div className="w-16 h-16 rounded-full border-2 border-background overflow-hidden">
                <img
                  src={group.avatar_url || "https://i.pravatar.cc/100"}
                  alt={group.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium truncate w-16 text-center">{group.username}</span>
          </button>
        ))}
      </div>

      {viewerOpen && allViewableGroups.length > 0 && (
        <StoryViewer
          groups={allViewableGroups}
          initialGroupIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
};

export default StoriesBar;
