import { useState, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminTopbar } from "./admin/AdminTopbar";
import { PanelSkeleton } from "./admin/components/PanelSkeleton";

const Dashboard      = lazy(() => import("./admin/Dashboard"));
const UsersPanel     = lazy(() => import("./admin/UsersPanel"));
const OrdersPanel    = lazy(() => import("./admin/OrdersPanel"));
const PlansPanel     = lazy(() => import("./admin/PlansPanel"));
const PortfolioPanel = lazy(() => import("./admin/PortfolioPanel"));
const FilesPanel     = lazy(() => import("./admin/FilesPanel"));
const SettingsPanel  = lazy(() => import("./admin/SettingsPanel"));
const ReviewsPanel   = lazy(() => import("./admin/ReviewsPanel").then(m => ({ default: m.ReviewsPanel })));

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
                <Route path="reviews"   element={<ReviewsPanel />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
