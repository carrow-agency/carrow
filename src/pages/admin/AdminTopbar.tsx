import { useLocation } from "react-router-dom";
import { Rocket } from "lucide-react";

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

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="flex items-center gap-4">
        <span className="text-gray-900 text-xl font-semibold">{current}</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
      </div>
    </header>
  );
}