import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsSecurity = () => {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (newPw.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast({ title: "Password updated successfully!" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      toast({ title: err.message || "Failed to update password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass-strong p-4 flex items-center gap-3">
        <Link to="/settings" className="p-1"><ArrowLeft size={22} /></Link>
        <h1 className="text-lg font-display font-bold">Security</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Change Password</p>
          <div className="glass rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Enter new password" className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button onClick={handleChangePassword} disabled={loading || !newPw || !confirmPw} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurity;
