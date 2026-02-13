import { useState, useRef } from "react";
import { Plus, X, Image, Film, Camera } from "lucide-react";
import { useCreatePost } from "@/hooks/use-posts";
import { useCreateStory } from "@/hooks/use-stories";
import { useCreateReel } from "@/hooks/use-reels";
import { useToast } from "@/hooks/use-toast";

type CreateType = "post" | "story" | "reel" | null;

const FloatingCreateButton = () => {
  const [open, setOpen] = useState(false);
  const [createType, setCreateType] = useState<CreateType>(null);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const createStory = useCreateStory();
  const createReel = useCreateReel();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!selectedFile) return;
    try {
      if (createType === "post") {
        await createPost.mutateAsync({ imageFile: selectedFile, caption });
      } else if (createType === "story") {
        await createStory.mutateAsync({ file: selectedFile, mediaType: selectedFile.type });
      } else if (createType === "reel") {
        await createReel.mutateAsync({ videoFile: selectedFile, caption });
      }
      toast({ title: `${createType} created!` });
      resetForm();
    } catch (err: any) {
      toast({ title: err.message || "Failed to create", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setOpen(false);
    setCreateType(null);
    setCaption("");
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const isSubmitting = createPost.isPending || createStory.isPending || createReel.isPending;

  if (createType) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-lg flex flex-col">
        <div className="flex items-center justify-between p-4">
          <button onClick={resetForm}><X size={24} /></button>
          <h2 className="text-lg font-display font-bold capitalize">New {createType}</h2>
          <button
            onClick={handleCreate}
            disabled={!selectedFile || isSubmitting}
            className="px-4 py-1.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Share"}
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept={createType === "reel" ? "video/*" : "image/*,video/*"} className="hidden" onChange={handleFileSelect} />

        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          {preview ? (
            <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden bg-secondary">
              {selectedFile?.type.startsWith("video") ? (
                <video src={preview} className="w-full h-full object-cover" controls />
              ) : (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="w-full max-w-sm aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-3">
              <Camera size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground">Tap to select {createType === "reel" ? "video" : "media"}</p>
            </button>
          )}

          {createType !== "story" && (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full max-w-sm bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none"
              rows={3}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex flex-col gap-2 animate-slide-up">
          <button onClick={() => setCreateType("post")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-secondary/50 transition-colors">
            <Image size={18} className="text-primary" />
            <span className="text-sm font-medium">Post</span>
          </button>
          <button onClick={() => setCreateType("story")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-secondary/50 transition-colors">
            <Camera size={18} className="text-primary" />
            <span className="text-sm font-medium">Story</span>
          </button>
          <button onClick={() => setCreateType("reel")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-secondary/50 transition-colors">
            <Film size={18} className="text-primary" />
            <span className="text-sm font-medium">Reel</span>
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg animate-pulse-neon transition-transform hover:scale-110 active:scale-95"
      >
        {open ? <X size={26} className="text-primary-foreground" /> : <Plus size={26} className="text-primary-foreground" />}
      </button>
    </>
  );
};

export default FloatingCreateButton;
