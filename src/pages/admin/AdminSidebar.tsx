import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Users, ShoppingBag, Layers, Image, FolderOpen, Settings, AlertCircle,
} from "lucide-react";

const items = [
  { to: "/admin",            label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/users",      label: "Users",     icon: Users },
  { to: "/admin/orders",     label: "Orders",    icon: ShoppingBag },
  { to: "/admin/plans",      label: "Plans",     icon: Layers },
  { to: "/admin/portfolio",  label: "Portfolio", icon: Image },
  { to: "/admin/files",      label: "Files",     icon: FolderOpen },
  { to: "/admin/settings",  label: "Settings",  icon: Settings },
  { to: "/admin/errors",   label: "Error Logs",icon: AlertCircle },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Carrow</h1>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="p-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">AK</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">Admin</p>
            <p className="truncate text-xs text-gray-500">admin@carrow.studio</p>
          </div>
        </div>
      </div>
    </aside>
  );
}