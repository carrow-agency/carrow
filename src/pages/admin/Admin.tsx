import { useState, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { PanelSkeleton } from "./components/PanelSkeleton";

const Dashboard = lazy(() => import("./Dashboard"));
const UsersPanel = lazy(() => import("./UsersPanel"));
const OrdersPanel = lazy(() => import("./OrdersPanel"));
const PlansPanel = lazy(() => import("./PlansPanel"));
const PortfolioPanel = lazy(() => import("./PortfolioPanel"));
const FilesPanel = lazy(() => import("./FilesPanel"));
const SettingsPanel = lazy(() => import("./SettingsPanel"));

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-admin-bg text-white">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-64 min-w-0">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Suspense fallback={<PanelSkeleton />}>
              <Routes>
                <Route index          element={<Dashboard />} />
                <Route path="users"     element={<UsersPanel />} />
                <Route path="orders"    element={<OrdersPanel />} />
                <Route path="plans"     element={<PlansPanel />} />
                <Route path="portfolio" element={<PortfolioPanel />} />
                <Route path="files"     element={<FilesPanel />} />
                <Route path="settings"  element={<SettingsPanel />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}