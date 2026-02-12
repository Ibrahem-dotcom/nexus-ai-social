import { Plus } from "lucide-react";

const FloatingCreateButton = () => {
  return (
    <button className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg animate-pulse-neon transition-transform hover:scale-110 active:scale-95">
      <Plus size={26} className="text-primary-foreground" />
    </button>
  );
};

export default FloatingCreateButton;
