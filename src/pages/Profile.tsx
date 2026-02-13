import { Settings, Grid3X3, Film, Bookmark, BadgeCheck, Camera } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useProfileStats, useUploadAvatar, useUpdateProfile } from "@/hooks/use-profile";
import { useUserPosts } from "@/hooks/use-posts";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { icon: Grid3X3, label: "posts" },
  { icon: Film, label: "reels" },
  { icon: Bookmark, label: "saved" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const { data: stats } = useProfileStats(user?.id);
  const { data: userPosts, isLoading: postsLoading } = useUserPosts(user?.id);
  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      toast({ title: "Avatar updated!" });
    } catch (err: any) {
      toast({ title: err.message || "Upload failed", variant: "destructive" });
    }
  };

  const startEditing = () => {
    setEditDisplayName(profile?.display_name || "");
    setEditBio(profile?.bio || "");
    setIsEditing(true);
  };

  const saveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ display_name: editDisplayName, bio: editBio });
      setIsEditing(false);
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: err.message || "Update failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-lg font-display font-bold">@{profile?.username || "user"}</span>
          {profile?.is_verified && <BadgeCheck size={18} className="text-primary" />}
        </div>
        <Link to="/settings" className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <Settings size={20} className="text-muted-foreground" />
        </Link>
      </div>

      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      <div className="px-4 py-4">
        <div className="flex items-center gap-6">
          <button onClick={() => avatarInputRef.current?.click()} className="relative w-20 h-20 rounded-full gradient-primary p-0.5 neon-glow">
            <img
              src={profile?.avatar_url || "https://i.pravatar.cc/200?img=68"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-background"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <Camera size={12} className="text-primary-foreground" />
            </div>
          </button>
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.posts ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("posts")}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.followers ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("followers")}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.following ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("following")}</p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Display name"
                className="w-full text-sm bg-secondary rounded-lg px-3 py-2 text-foreground"
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Bio"
                className="w-full text-sm bg-secondary rounded-lg px-3 py-2 text-foreground resize-none"
                rows={3}
              />
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-sm">{profile?.display_name || "User"}</h2>
              {profile?.is_founder && (
                <p className="text-xs text-primary font-medium">{t("founder")}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.bio || "No bio yet"}
              </p>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {isEditing ? (
            <>
              <button onClick={saveProfile} disabled={updateProfile.isPending} className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">
                {updateProfile.isPending ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={startEditing} className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">
                {t("edit_profile")}
              </button>
              <button className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">
                {t("share_profile")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-3 flex items-center justify-center transition-colors ${
              activeTab === i ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            <tab.icon size={20} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {postsLoading && (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse" />
            ))}
          </>
        )}
        {userPosts?.map((post) => (
          <div key={post.id} className="aspect-square overflow-hidden bg-secondary">
            {post.image_url ? (
              <img src={post.image_url} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
            )}
          </div>
        ))}
        {!postsLoading && userPosts?.length === 0 && (
          <div className="col-span-3 py-16 text-center text-muted-foreground">
            <p>No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
