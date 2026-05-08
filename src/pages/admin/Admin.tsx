import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import Dashboard from "./Dashboard";
import UsersPanel from "./UsersPanel";
import OrdersPanel from "./OrdersPanel";
import PlansPanel from "./PlansPanel";
import PortfolioPanel from "./PortfolioPanel";
import FilesPanel from "./FilesPanel";
import SettingsPanel from "./SettingsPanel";
import ProfilePanel from "./ProfilePanel";

export default function Admin() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col ml-64">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPanel />} />
              <Route path="orders" element={<OrdersPanel />} />
              <Route path="plans" element={<PlansPanel />} />
              <Route path="portfolio" element={<PortfolioPanel />} />
              <Route path="files" element={<FilesPanel />} />
              <Route path="settings" element={<SettingsPanel />} />
              <Route path="profile" element={<ProfilePanel />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}