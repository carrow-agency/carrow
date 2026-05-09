import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { DataTable, Column } from "./components/DataTable";
import { StatusBadge } from "./components/StatusBadge";
import { StatsCard } from "./components/StatsCard";
import { Button } from "./components/Button";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "../../lib/useConvex";
import { CheckCircle2, XCircle, Trash2, ShoppingBag } from "lucide-react";

interface OrderData {
  id: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  date: string;
  status: "Pending" | "Active" | "Cancelled";
}

type TabType = "All" | "Pending" | "Active" | "Cancelled";

export default function OrdersPanel() {
  const { orders, status, loadMore } = useOrders() || { orders: [], status: "Exhausted" as const, loadMore: () => {} };
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const [tab, setTab]     = useState<TabType>("All");
  const [activateTarget, setActivateTarget] = useState<OrderData | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const data = useMemo(
    () => (orders ?? []).filter(o => tab === "All" || o.status === tab),
    [orders, tab]
  );

  const totalOrders     = orders?.length ?? 0;
  const pendingOrders   = orders?.filter(o => o.status === "Pending").length ?? 0;
  const activeOrders    = orders?.filter(o => o.status === "Active").length ?? 0;
  const cancelledOrders = orders?.filter(o => o.status === "Cancelled").length ?? 0;

  const handleActivate = async () => {
    if (!activateTarget) return;
    setActionLoading(true);
    try { await updateOrderStatus({ id: activateTarget.id as any, status: "Active" }); }
    catch (e) { console.error(e); }
    setActionLoading(false);
    setActivateTarget(null);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try { await updateOrderStatus({ id: cancelTarget as any, status: "Cancelled" }); }
    catch (e) { console.error(e); }
    setActionLoading(false);
    setCancelTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try { await deleteOrder({ id: deleteTarget as any }); }
    catch (e) { console.error(e); }
    setActionLoading(false);
    setDeleteTarget(null);
  };

  const cols: Column<OrderData>[] = [
    {
      key: "client", header: "Client",
      render: o => (
        <div>
          <p className="text-sm font-medium text-white">{o.clientName}</p>
          <p className="text-xs text-admin-muted">{o.clientEmail}</p>
        </div>
      ),
    },
    { key: "plan",   header: "Plan",   render: o => <span className="text-sm text-white/80">{o.plan}</span> },
    { key: "date",   header: "Date",   render: o => <span className="text-xs text-admin-muted">{o.date}</span> },
    { key: "status", header: "Status", render: o => <StatusBadge status={o.status} /> },
    {
      key: "actions", header: "", align: "right",
      render: o => (
        <div className="flex justify-end gap-1.5">
          {o.status === "Pending" && (
            <Button size="sm" variant="secondary" onClick={() => setActivateTarget(o)} disabled={actionLoading}>
              <CheckCircle2 size={13} /> Activate
            </Button>
          )}
          {o.status !== "Cancelled" && (
            <Button size="sm" variant="ghost" onClick={() => setCancelTarget(o.id)} title="Cancel order">
              <XCircle size={13} />
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(o.id)} title="Delete order">
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Subscription orders and plan activations from all clients."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total"     value={String(totalOrders)}     icon={<ShoppingBag size={15}/>} iconColor="text-white/30" />
        <StatsCard label="Pending"   value={String(pendingOrders)}   icon={<ShoppingBag size={15}/>} iconColor="text-amber-400" />
        <StatsCard label="Active"    value={String(activeOrders)}    icon={<ShoppingBag size={15}/>} iconColor="text-green-400" />
        <StatsCard label="Cancelled" value={String(cancelledOrders)} icon={<ShoppingBag size={15}/>} iconColor="text-red-400" />
      </div>

      <div className="flex items-center gap-2">
        {(["All","Pending","Active","Cancelled"] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
              tab === t
                ? "border-white bg-white text-admin-bg"
                : "border-admin-border bg-admin-surface text-admin-muted hover:text-white hover:border-white/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <DataTable columns={cols} data={data} rowKey={o => o.id} />

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => loadMore(50)}>Load more</Button>
        </div>
      )}
      {status === "LoadingMore" && <p className="text-center text-sm text-admin-muted">Loading…</p>}

      {/* Activate confirmation */}
      <ConfirmDialog
        open={!!activateTarget}
        onClose={() => setActivateTarget(null)}
        onConfirm={handleActivate}
        loading={actionLoading}
        title="Activate Plan?"
        description={`You are about to activate the ${activateTarget?.plan} plan for ${activateTarget?.clientName}. This will start their billing cycle and grant them full access.`}
        confirmLabel="Activate Plan"
      />

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={actionLoading}
        title="Cancel this order?"
        description="The client's plan status will be set to 'none'. This action cannot be undone."
        confirmLabel="Cancel Order"
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Delete this order?"
        description="The order record will be permanently removed. The client's plan status will not be changed."
        confirmLabel="Delete"
      />
    </div>
  );
}
