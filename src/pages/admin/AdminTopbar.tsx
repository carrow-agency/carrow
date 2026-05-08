import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Rocket, Loader2, Check } from "lucide-react";

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Users",
  "/admin/orders": "Orders",
  "/admin/plans": "Plans",
  "/admin/portfolio": "Portfolio",
  "/admin/files": "Files",
  "/admin/settings": "Settings",
  "/admin/profile": "Profile",
};

export function AdminTopbar() {
  const { pathname } = useLocation();
  const current = titles[pathname] ?? "Admin";
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Deploy failed');
      }
      
      setDeployed(true);
      setTimeout(() => setDeployed(false), 3000);
    } catch (error) {
      console.error("Deploy failed:", error);
      alert("Deploy not available. Use Vercel CLI or git push.");
    }
    setDeploying(false);
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-admin-border bg-admin-bg/80 px-10 backdrop-blur">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-admin-muted">Carrow</span>
        <span className="text-admin-muted">/</span>
        <span className="text-white">{current}</span>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            deployed 
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {deploying ? (
            <Loader2 size={14} className="animate-spin" />
          ) : deployed ? (
            <Check size={14} />
          ) : (
            <Rocket size={14} />
          )}
          {deploying ? "Deploying..." : deployed ? "Deployed!" : "Deploy"}
        </button>
        <div className="flex items-center gap-6 text-xs text-admin-muted">
          <span className="hidden md:inline">v3.2 · Production</span>
          <span className="hidden md:inline">•</span>
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>
      </div>
    </header>
  );
}