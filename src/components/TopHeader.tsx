import nexusLogo from "@/assets/nexus-logo.png";
import { Bell, Heart } from "lucide-react";

const TopHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-glass-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <img src={nexusLogo} alt="NEXUS" className="w-8 h-8 rounded-lg" />
          <h1 className="text-xl font-display font-bold gradient-text">NEXUS</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <Heart size={20} className="text-muted-foreground" />
          </button>
          <button className="p-2 rounded-xl hover:bg-secondary transition-colors relative">
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
