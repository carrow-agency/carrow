import { Users, ShoppingBag, Image as ImageIcon, Plus, ArrowRight, AlertCircle, FileText, Clock, ChevronDown } from "lucide-react";
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

  const orderCols: Column<OrderData>[] = [
    { key: "client", header: "Client", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold uppercase">
          {r.clientName ? r.clientName.split(" ").map(p => p[0]).slice(0,2).join("") : "?"}
        </div>
        <div>
          <p className="font-medium text-gray-900">{r.clientName || "Unknown"}</p>
          <p className="text-xs text-gray-500">{r.clientEmail || "—"}</p>
        </div>
      </div>
    )},
    { key: "plan", header: "Plan", render: (r) => <span className="text-gray-600">{r.plan}</span> },
    { key: "date", header: "Date", render: (r) => <span className="text-gray-500">{r.date}</span> },
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor your clients, orders, and performance.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">Total Clients</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{users?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">{activeClients} active</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">Orders This Month</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{thisMonthOrders}</p>
          <p className="text-xs text-gray-500 mt-1">{pendingOrders} pending</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">Portfolio Items</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalWorks}</p>
          <p className="text-xs text-gray-500 mt-1">published</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">Contracts</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{contracts?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">uploaded</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>View all</Button>
          </div>
          <DataTable columns={orderCols} data={recentOrdersList} />
        </div>

        {/* Recent Contracts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Contracts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentContractsList.length > 0 ? recentContractsList.map(contract => (
              <div key={contract._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contract.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{contract.type}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{contract.createdAt?.slice(0, 10)}</span>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">No contracts uploaded</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Select Client</label>
          <select 
            value={selectedClient}
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
          >
            <option value="">Select a client...</option>
            {users?.map((user: any) => (
              <option key={user._id} value={user._id}>{user.name} — {user.email}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">Select a client to view details, works, contracts, and reports.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <Plus size={14} /> New Order
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/portfolio')}>
            <Plus size={14} /> Add Work
          </Button>
        </div>
      </div>
    </div>
  );
}