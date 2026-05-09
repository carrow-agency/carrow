import { useState } from "react";
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
import ErrorsPanel from "./ErrorsPanel";

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-admin-bg text-white">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-64 min-w-0">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Routes>
              <Route index          element={<Dashboard />} />
              <Route path="users"     element={<UsersPanel />} />
              <Route path="orders"    element={<OrdersPanel />} />
              <Route path="plans"     element={<PlansPanel />} />
              <Route path="portfolio" element={<PortfolioPanel />} />
              <Route path="files"     element={<FilesPanel />} />
              <Route path="settings"  element={<SettingsPanel />} />
              <Route path="errors"    element={<ErrorsPanel />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}