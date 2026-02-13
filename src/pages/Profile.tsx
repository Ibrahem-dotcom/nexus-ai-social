import { Settings, Grid3X3, Film, Bookmark } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { BadgeCheck } from "lucide-react";

const profilePosts = [
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop",
];

const tabs = [
  { icon: Grid3X3, label: "posts" },
  { icon: Film, label: "reels" },
  { icon: Bookmark, label: "saved" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { profile } = useAuth();
  const { t } = useTranslation();

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

      <div className="px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full gradient-primary p-0.5 neon-glow">
            <img
              src={profile?.avatar_url || "https://i.pravatar.cc/200?img=68"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-background"
            />
          </div>
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-lg font-bold">42</p>
              <p className="text-xs text-muted-foreground">{t("posts")}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">12.4K</p>
              <p className="text-xs text-muted-foreground">{t("followers")}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">891</p>
              <p className="text-xs text-muted-foreground">{t("following")}</p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="font-semibold text-sm">{profile?.display_name || "User"}</h2>
          {profile?.is_founder && (
            <p className="text-xs text-primary font-medium">{t("founder")}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.bio || "Building NEXUS — the future of social networking 🚀"}
          </p>
        </div>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">
            {t("edit_profile")}
          </button>
          <button className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">
            {t("share_profile")}
          </button>
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
        {profilePosts.map((img, i) => (
          <div key={i} className="aspect-square overflow-hidden bg-secondary">
            <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
