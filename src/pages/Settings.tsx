import { ArrowLeft, ChevronRight, Globe, Shield, Bell, Palette, CircleUser, LogOut, Lock, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import nexusLogo from "@/assets/nexus-icon.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
];

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLang = languages.find((l) => l.code === i18n.language)?.label || "English";

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const cycleLang = () => {
    const idx = languages.findIndex((l) => l.code === i18n.language);
    const next = languages[(idx + 1) % languages.length];
    i18n.changeLanguage(next.code);
  };

  const settingsGroups = [
    {
      title: t("account"),
      items: [
        { icon: CircleUser, label: t("edit_profile"), desc: "Name, bio, avatar", action: () => navigate("/profile") },
        { icon: Shield, label: t("security"), desc: "Password", action: () => navigate("/settings/security") },
        { icon: Eye, label: "Privacy", desc: "Account, interactions", action: () => navigate("/settings/privacy") },
        { icon: Bell, label: t("notifications"), desc: "Push notifications", action: () => navigate("/settings/notifications") },
      ],
    },
    {
      title: t("preferences"),
      items: [
        { icon: Globe, label: t("language"), desc: currentLang, action: cycleLang },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4 flex items-center gap-3">
        <Link to="/profile" className="p-1">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-lg font-display font-bold">{t("settings")}</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {settingsGroups.map((group, gi) => (
          <div key={gi}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</p>
            <div className="glass rounded-xl overflow-hidden divide-y divide-border">
              {group.items.map((item, i) => (
                <button key={i} onClick={item.action} className="flex items-center gap-3 w-full p-3.5 hover:bg-secondary/30 transition-colors">
                  <item.icon size={20} className="text-primary" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* About */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("about")}</p>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src={nexusLogo} alt="NEXUS" className="w-12 h-12 rounded-xl" />
              <div>
                <h3 className="font-display font-bold gradient-text text-lg">NEXUS</h3>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Developed by <span className="text-foreground font-semibold">Ibrahem Abood</span></p>
              <p>© 2026 NEXUS. All rights reserved.</p>
              <p className="text-xs">100% owned by Ibrahem Abood</p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3.5 glass rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">{t("logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
