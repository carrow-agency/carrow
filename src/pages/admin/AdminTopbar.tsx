import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

const titles: Record<string, string> = {
  "/admin":           "Dashboard",
  "/admin/users":     "Users",
  "/admin/orders":    "Orders",
  "/admin/plans":     "Plans",
  "/admin/portfolio": "Portfolio",
  "/admin/files":     "Files",
  "/admin/settings":  "Settings",
  "/admin/errors":    "Error Logs",
};

interface Props {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: Props) {
  const { pathname } = useLocation();
  const current = titles[pathname] ?? "Admin";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-admin-border bg-admin-sidebar/90 backdrop-blur-sm px-5 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-admin-muted hover:bg-white/5 hover:text-white transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={17} />
        </button>
        <span className="text-base font-semibold text-white tracking-tight">{current}</span>
      </div>
      <span className="text-xs text-admin-muted hidden sm:block">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </span>
    </header>
  );
}