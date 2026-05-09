import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ShoppingBag, Image as ImageIcon, FileText, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { PageHeader } from "./components/PageHeader";
import { StatsCard } from "./components/StatsCard";
import { DataTable, Column } from "./components/DataTable";
import { StatusBadge } from "./components/StatusBadge";
import { Button } from "./components/Button";
import { OverviewChart, PlanDistributionChart } from "./components/Charts";
import { useUsers, useOrders, usePlans, useWorks, useContracts, usePendingPlanRequests } from "../../lib/useConvex";

interface OrderRow {
  id: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  date: string;
  status: "Pending" | "Active" | "Cancelled";
}

export default function Dashboard() {
  const { users }   = useUsers()   || { users: [] };
  const { orders }  = useOrders()  || { orders: [] };
  const { works }   = useWorks()   || { works: [] };
  const plans       = usePlans() ?? [];
  const contracts   = useContracts() ?? [];
  const pendingRequests = usePendingPlanRequests() ?? [];
  const navigate    = useNavigate();

  const activeClients   = users?.filter(u => u.planStatus === "active").length ?? 0;
  const pendingOrders   = orders?.filter(o => o.status === "Pending").length ?? 0;
  const publishedWorks  = works?.filter(w => (w as any).published !== false).length ?? 0;

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const thisMonthOrders = orders?.filter(o => o.date?.startsWith(thisMonth)).length ?? 0;

  // Orders by last 6 months
  const ordersByMonth = useMemo(() => {
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`] = 0;
    }
    orders?.forEach(o => {
      if (o.date) {
        const k = o.date.slice(0, 7);
        if (months[k] !== undefined) months[k]++;
      }
    });
    return Object.entries(months).map(([key, value]) => ({
      name: monthNames[parseInt(key.split("-")[1] || "1") - 1] || "",
      value,
    }));
  }, [orders]);

  // Plan distribution using plan NAMES not IDs
  const planDist = useMemo(() => {
    if (!users?.length) return [{ name: "No Data", value: 1 }];
    const counts: Record<string, number> = {};
    users.forEach(u => {
      let label = "No Plan";
      if (u.planStatus === "active" && u.planId) {
        label = plans.find(p => p.id === u.planId)?.name ?? "Unknown Plan";
      } else if (u.planStatus === "pending") {
        label = "Pending";
      }
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [users, plans]);

  const recentOrders: OrderRow[] = (orders ?? []).slice(0, 6);
  const recentContracts = contracts.slice(0, 5);

  const orderCols: Column<OrderRow>[] = [
    {
      key: "client", header: "Client",
      render: r => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white uppercase">
            {r.clientName?.split(" ").map(p => p[0]).slice(0,2).join("") ?? "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-white leading-tight">{r.clientName || "Unknown"}</p>
            <p className="text-xs text-admin-muted leading-tight">{r.clientEmail}</p>
          </div>
        </div>
      ),
    },
    { key: "plan", header: "Plan", render: r => <span className="text-sm text-admin-muted">{r.plan}</span> },
    { key: "date", header: "Date", render: r => <span className="text-xs text-admin-muted">{r.date}</span> },
    { key: "status", header: "Status", render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Monitor clients, orders, and performance at a glance."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Clients"
          value={String(users?.length ?? 0)}
          hint={`${activeClients} active`}
          icon={<Users size={16} />}
          iconColor="text-green-500"
        />
        <StatsCard
          label="Orders This Month"
          value={String(thisMonthOrders)}
          hint={`${pendingOrders} pending`}
          icon={<ShoppingBag size={16} />}
          iconColor="text-blue-400"
        />
        <StatsCard
          label="Published Works"
          value={String(publishedWorks)}
          hint={`${works?.length ?? 0} total`}
          icon={<ImageIcon size={16} />}
          iconColor="text-purple-400"
        />
        <StatsCard
          label="Contracts"
          value={String(contracts.length)}
          hint="uploaded"
          icon={<FileText size={16} />}
          iconColor="text-amber-400"
        />
      </div>

      {/* Pending plan requests alert */}
      {pendingRequests.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <ShoppingBag size={16} />
            </span>
            <div>
              <p className="text-sm font-medium text-white">
                {pendingRequests.length} pending plan {pendingRequests.length === 1 ? "request" : "requests"}
              </p>
              <p className="text-xs text-admin-muted">Clients waiting for plan approval</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/orders")}>
            Review
          </Button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-admin-border bg-admin-surface p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-admin-accent" />
            <h2 className="text-sm font-semibold text-white">Orders — Last 6 Months</h2>
          </div>
          <OverviewChart data={ordersByMonth} />
        </div>
        <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Plan Distribution</h2>
          </div>
          <PlanDistributionChart data={planDist} />
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>View all</Button>
          </div>
          <DataTable
            columns={orderCols}
            data={recentOrders}
            rowKey={r => r.id}
            empty="No orders yet"
          />
        </div>

        <div className="rounded-xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-white">Recent Contracts</h2>
          </div>
          <div className="divide-y divide-admin-border">
            {recentContracts.length > 0 ? recentContracts.map(c => (
              <div key={c._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-admin-muted">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.title}</p>
                    <p className="text-xs text-admin-muted capitalize">{c.type}</p>
                  </div>
                </div>
                <span className="text-xs text-admin-muted shrink-0 ml-3">{c.createdAt?.slice(0,10)}</span>
              </div>
            )) : (
              <p className="px-5 py-8 text-sm text-admin-muted text-center">No contracts uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
