import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Users, ShoppingBag, Layers, Image,
  FolderOpen, Settings, AlertCircle, X, LogOut, Shield, Star
} from "lucide-react";
import { useCurrentUserFromConvex, useAuthFunctions } from "../../lib/useConvex";

const items = [
  { to: "/admin",           label: "Dashboard",  icon: LayoutGrid,  end: true },
  { to: "/admin/users",     label: "Users",      icon: Users },
  { to: "/admin/orders",    label: "Orders",     icon: ShoppingBag },
  { to: "/admin/plans",     label: "Plans",      icon: Layers },
  { to: "/admin/portfolio", label: "Portfolio",  icon: Image },
  { to: "/admin/files",     label: "Files",      icon: FolderOpen },
  { to: "/admin/settings",  label: "Settings",   icon: Settings },
  { to: "/admin/errors",    label: "Error Logs", icon: AlertCircle },
  { to: "/admin/audit",     label: "Audit Logs", icon: Shield },
  { to: "/admin/reviews",   label: "Reviews",    icon: Star },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: Props) {
  const currentUser = useCurrentUserFromConvex();
  const { signOut } = useAuthFunctions();
  const navigate = useNavigate();

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "A";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-admin-border bg-admin-sidebar transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-admin-border px-5 py-5">
          <div>
            <h1 className="font-serif text-xl font-bold text-white tracking-tight leading-none">
              Carrow
            </h1>
            <p className="text-[10px] uppercase tracking-[0.22em] text-admin-muted mt-1">
              Admin Console
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-admin-muted hover:bg-white/5 hover:text-white transition-colors lg:hidden"
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white text-admin-bg shadow-sm"
                    : "text-admin-muted hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="border-t border-admin-border p-3">
          <div className="flex items-center gap-3 rounded-lg bg-admin-surface px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-admin-bg text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white leading-tight">
                {currentUser?.name || "Admin"}
              </p>
              <p className="truncate text-[11px] text-admin-muted leading-tight">
                {currentUser?.email || ""}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-admin-muted hover:bg-white/5 hover:text-admin-danger transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}