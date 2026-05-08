import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Users, ShoppingBag, Layers, Image, FolderOpen, Settings, UserCircle2, LogOut,
} from "lucide-react";

const items = [
  { to: "/admin",            label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/users",      label: "Users",     icon: Users },
  { to: "/admin/orders",     label: "Orders",    icon: ShoppingBag },
  { to: "/admin/plans",      label: "Plans",     icon: Layers },
  { to: "/admin/portfolio",  label: "Portfolio", icon: Image },
  { to: "/admin/files",      label: "Files",     icon: FolderOpen },
  { to: "/admin/settings",   label: "Settings",  icon: Settings },
  { to: "/admin/profile",    label: "Profile",   icon: UserCircle2 },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-admin-border bg-admin-bg lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-admin-border px-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-admin-border bg-admin-surface">
          <span className="font-display text-lg font-bold tracking-tight text-white">C</span>
        </div>
        <div>
          <p className="font-display text-base font-semibold tracking-tight">Carrow</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-admin-muted">Studio Console</p>
        </div>
      </div>

      <div className="px-5 pt-6">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Workspace</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-admin-surface text-white"
                  : "text-admin-muted hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={1.75} className={isActive ? "text-white" : "text-admin-muted group-hover:text-white"} />
                <span>{label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-admin-border p-4">
        <div className="flex items-center gap-3 rounded-md bg-admin-surface px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">AK</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Adrian Kovac</p>
            <p className="truncate text-xs text-admin-muted">Founder · Admin</p>
          </div>
          <button className="rounded-md p-2 text-admin-muted transition-colors hover:bg-white/5 hover:text-white" title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
