import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserSettings, useUpdateSettings } from "@/hooks/use-settings";

const SettingsNotifications = () => {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();

  const toggles = [
    { key: "notify_likes", label: "Likes", desc: "When someone likes your post" },
    { key: "notify_comments", label: "Comments", desc: "When someone comments on your post" },
    { key: "notify_follows", label: "Follows", desc: "When someone follows you" },
    { key: "notify_messages", label: "Messages", desc: "When you receive a new message" },
  ] as const;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4 flex items-center gap-3">
        <Link to="/settings" className="p-1"><ArrowLeft size={22} /></Link>
        <h1 className="text-lg font-display font-bold">Notifications</h1>
      </div>

      <div className="px-4 py-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Push Notifications</p>
        <div className="glass rounded-xl divide-y divide-border">
          {toggles.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button
                onClick={() => updateSettings.mutate({ [key]: !settings?.[key] } as any)}
                className={`w-12 h-7 rounded-full transition-colors relative ${settings?.[key] ? "bg-primary" : "bg-secondary"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-foreground transition-transform ${settings?.[key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsNotifications;
