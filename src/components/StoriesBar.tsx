import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStories, useCreateStory } from "@/hooks/use-stories";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StoriesBar = () => {
  const { user, profile } = useAuth();
  const { data: storyGroups, isLoading } = useStories();
  const createStory = useCreateStory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  return (
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

      {storyGroups?.filter(g => g.user_id !== user?.id).map((group) => (
        <button key={group.user_id} className="flex flex-col items-center gap-1 min-w-fit">
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
  );
};

export default StoriesBar;
