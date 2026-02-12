import { ArrowLeft, ChevronRight, Info, Globe, Shield, Bell, Palette, CircleUser, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import nexusLogo from "@/assets/nexus-icon.jpg";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: CircleUser, label: "Edit Profile", desc: "Name, bio, avatar" },
      { icon: Shield, label: "Security", desc: "Password, 2FA" },
      { icon: Bell, label: "Notifications", desc: "Push, email, sounds" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Globe, label: "Language", desc: "English" },
      { icon: Palette, label: "Appearance", desc: "Dark mode" },
    ],
  },
];

const Settings = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4 flex items-center gap-3">
        <Link to="/profile" className="p-1">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-lg font-display font-bold">Settings</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {settingsGroups.map((group, gi) => (
          <div key={gi}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</p>
            <div className="glass rounded-xl overflow-hidden divide-y divide-border">
              {group.items.map((item, i) => (
                <button key={i} className="flex items-center gap-3 w-full p-3.5 hover:bg-secondary/30 transition-colors">
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</p>
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

        <button className="flex items-center gap-3 w-full p-3.5 glass rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
