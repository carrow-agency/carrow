import { Users, ShoppingBag, DollarSign, Image as ImageIcon, Plus, ArrowRight, AlertCircle, FileText, Clock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { StatsCard } from "./components/StatsCard";
import { DataTable, Column } from "./components/DataTable";
import { StatusBadge } from "./components/StatusBadge";
import { Button } from "./components/Button";
import { useUsers, useOrders, usePlans, useWorks, useOrdersStats, useContracts } from "../../lib/useConvex";

interface OrderData {
  id: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  date: string;
  status: "Pending" | "Active" | "Cancelled";
}

export default function Dashboard() {
  const users = useUsers();
  const orders = useOrders();
  const plans = usePlans();
  const works = useWorks();
  const orderStats = useOrdersStats();
  const contracts = useContracts();
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<string>("");

  const activeClients = users?.filter(u => u.planStatus === "active").length ?? 0;
  const pendingOrders = orders?.filter(o => o.status === "Pending").length ?? 0;
  const totalWorks = works?.length ?? 0;
  
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const thisMonthOrders = orders?.filter(o => o.date?.startsWith(thisMonth)).length ?? 0;
  
  const recentContractsList = contracts?.slice(0, 5) ?? [];
  const recentOrdersList = orders?.slice(0, 5) ?? [];
  
  const expiringUsers = users?.filter(u => {
    return false; // planExpiry is filtered from query, simplified for now
  }) ?? [];

  const orderCols: Column<OrderData>[] = [
    { key: "client", header: "Client", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-admin-border bg-admin-surface2 text-xs font-semibold uppercase">
          {r.clientName.split(" ").map(p => p[0]).slice(0,2).join("")}
        </div>
        <div>
          <p className="font-medium text-white">{r.clientName}</p>
          <p className="text-xs text-admin-muted">{r.clientEmail}</p>
        </div>
      </div>
    )},
    { key: "plan", header: "Plan", render: (r) => <span className="text-white/90">{r.plan}</span> },
    { key: "date", header: "Date", render: (r) => <span className="text-admin-muted">{r.date}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    if (clientId) {
      navigate(`/admin/client/${clientId}`);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Monitor your clients, orders, and performance."
      />

      {/* Stats Row */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Clients" value={String(users?.length ?? 0)} hint={`${activeClients} active`} icon={<Users size={16} />} />
        <StatsCard label="Orders This Month" value={String(thisMonthOrders)} hint={`${pendingOrders} pending`} icon={<ShoppingBag size={16} />} />
        <StatsCard label="Portfolio Items" value={String(totalWorks)} hint="published" icon={<ImageIcon size={16} />} />
        <StatsCard label="Expiring Soon" value={String(expiringUsers.length)} hint="within 7 days" icon={<Clock size={16} />} className={expiringUsers.length > 0 ? "border-yellow-500/50" : ""} />
      </section>

      {/* Expiring Soon Alert */}
      {expiringUsers.length > 0 && (
        <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-500" />
            <div>
              <p className="font-medium text-yellow-500">Plans Expiring Soon</p>
              <p className="text-sm text-yellow-500/70">
                {expiringUsers.map(u => u.name).join(", ")} — expiring within 7 days
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Orders */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Recent</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">Orders</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>View all</Button>
          </div>
          <DataTable columns={orderCols} data={recentOrdersList} />
        </section>

        {/* Recent Contracts */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Recent</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">Contracts</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/contracts')}>View all</Button>
          </div>
          <div className="rounded-xl border border-admin-border bg-admin-surface divide-y divide-admin-border">
            {recentContractsList.length > 0 ? recentContractsList.map(contract => (
              <div key={contract._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-admin-muted" />
                  <div>
                    <p className="text-sm font-medium text-white">{contract.title}</p>
                    <p className="text-xs text-admin-muted capitalize">{contract.type}</p>
                  </div>
                </div>
                <span className="text-xs text-admin-muted">{contract.createdAt?.slice(0, 10)}</span>
              </div>
            )) : (
              <div className="p-8 text-center text-admin-muted">No contracts uploaded</div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="rounded-xl border border-admin-border bg-admin-surface p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Quick Actions</p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">Manage Client</h3>
        
        <div className="mt-6">
          <label className="text-xs text-admin-muted mb-2 block">Select Client</label>
          <select 
            value={selectedClient}
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full rounded-lg border border-admin-border bg-admin-surface2 px-4 py-3 text-white"
          >
            <option value="">Select a client...</option>
            {users?.map((user: any) => (
              <option key={user._id} value={user._id}>{user.name} — {user.email}</option>
            ))}
          </select>
          <p className="text-xs text-admin-muted mt-2">Select a client to view details, works, contracts, and reports.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/orders')}>
            <Plus size={14} /> New Order
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/portfolio')}>
            <Plus size={14} /> Add Work
          </Button>
        </div>
      </section>
    </div>
  );
}