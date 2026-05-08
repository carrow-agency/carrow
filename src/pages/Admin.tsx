import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminTopbar } from "./admin/AdminTopbar";
import Dashboard from "./admin/Dashboard";
import UsersPanel from "./admin/UsersPanel";
import OrdersPanel from "./admin/OrdersPanel";
import PlansPanel from "./admin/PlansPanel";
import PortfolioPanel from "./admin/PortfolioPanel";
import FilesPanel from "./admin/FilesPanel";
import SettingsPanel from "./admin/SettingsPanel";

export default function Admin() {
  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto px-10 py-10">
          <div className="mx-auto max-w-[1320px]">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPanel />} />
              <Route path="orders" element={<OrdersPanel />} />
              <Route path="plans" element={<PlansPanel />} />
              <Route path="portfolio" element={<PortfolioPanel />} />
              <Route path="files" element={<FilesPanel />} />
              <Route path="settings" element={<SettingsPanel />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
