import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserSettings, useUpdateSettings } from "@/hooks/use-settings";

const options = ["everyone", "followers", "nobody"];

const SettingsPrivacy = () => {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();

  const toggle = (key: string, value: any) => {
    updateSettings.mutate({ [key]: value } as any);
  };

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
        <h1 className="text-lg font-display font-bold">Privacy</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</p>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Private Account</p>
                <p className="text-xs text-muted-foreground">Only followers can see your posts</p>
              </div>
              <button
                onClick={() => toggle("private_account", !settings?.private_account)}
                className={`w-12 h-7 rounded-full transition-colors relative ${settings?.private_account ? "bg-primary" : "bg-secondary"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-foreground transition-transform ${settings?.private_account ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Interactions</p>
          <div className="glass rounded-xl divide-y divide-border">
            <div className="p-4">
              <p className="text-sm font-medium mb-2">Who can comment</p>
              <div className="flex gap-2">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggle("who_can_comment", opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${settings?.who_can_comment === opt ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium mb-2">Who can message</p>
              <div className="flex gap-2">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggle("who_can_message", opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${settings?.who_can_message === opt ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPrivacy;
