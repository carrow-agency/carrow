import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { DataTable, Column } from "./components/DataTable";
import { StatusBadge } from "./components/StatusBadge";
import { StatsCard } from "./components/StatsCard";
import { Button } from "./components/Button";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useOrders, useUpdateOrderStatus, useDeleteOrder, usePlanRequests, useUpdatePlanRequestStatus, useDeletePlanRequest } from "../../lib/useConvex";
import { withErrorHandler } from "../../lib/mutationHandler";
import { Id } from "../../../convex/_generated/dataModel";
import { CheckCircle2, XCircle, Trash2, ShoppingBag, Clock } from "lucide-react";

interface OrderData {
  id: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  date: string;
  status: "Pending" | "Active" | "Cancelled";
}

interface PlanRequestData {
  _id: string;
  clientName?: string;
  clientEmail?: string;
  type: string;
  planName?: string;
  previousPlan?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

type TabType = "All" | "Pending" | "Active" | "Cancelled";

export default function OrdersPanel() {
  const { orders, status, loadMore } = useOrders() || { orders: [], status: "Exhausted" as const, loadMore: () => {} };
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const requests = usePlanRequests() ?? [];
  const updateRequestStatus = useUpdatePlanRequestStatus();
  const deleteRequest = useDeletePlanRequest();

  const [tab, setTab]     = useState<TabType>("All");
  const [activateTarget, setActivateTarget] = useState<OrderData | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  // Plan Request actions
  const [approveReqTarget, setApproveReqTarget] = useState<PlanRequestData | null>(null);
  const [rejectReqTarget, setRejectReqTarget] = useState<PlanRequestData | null>(null);
  
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
    await withErrorHandler(async () => {
      await updateOrderStatus({ id: activateTarget.id as Id<"orders">, status: "Active" });
      setActivateTarget(null);
    }, setActionLoading, { showSuccessToast: true, successMessage: "Order activated successfully" });
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    await withErrorHandler(async () => {
      await updateOrderStatus({ id: cancelTarget as Id<"orders">, status: "Cancelled" });
      setCancelTarget(null);
    }, setActionLoading, { showSuccessToast: true, successMessage: "Order cancelled" });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await withErrorHandler(async () => {
      await deleteOrder({ id: deleteTarget as Id<"orders"> });
      setDeleteTarget(null);
    }, setActionLoading, { showSuccessToast: true, successMessage: "Order deleted" });
  };

  const handleApproveRequest = async () => {
    if (!approveReqTarget) return;
    await withErrorHandler(async () => {
      await updateRequestStatus({ id: approveReqTarget._id as Id<"planRequests">, status: "approved" });
      setApproveReqTarget(null);
    }, setActionLoading, { showSuccessToast: true, successMessage: "Plan request approved" });
  };

  const handleRejectRequest = async () => {
    if (!rejectReqTarget) return;
    await withErrorHandler(async () => {
      await updateRequestStatus({ id: rejectReqTarget._id as Id<"planRequests">, status: "rejected" });
      setRejectReqTarget(null);
    }, setActionLoading, { showSuccessToast: true, successMessage: "Plan request rejected" });
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Delete this request record permanently?")) return;
    await withErrorHandler(async () => {
      await deleteRequest({ id: id as Id<"planRequests"> });
    }, undefined, { showSuccessToast: true, successMessage: "Plan request deleted" });
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

  const reqCols: Column<PlanRequestData>[] = [
    {
      key: "client", header: "Client",
      render: r => (
        <div>
          <p className="text-sm font-medium text-white">{r.clientName}</p>
          <p className="text-xs text-admin-muted">{r.clientEmail}</p>
        </div>
      ),
    },
    { key: "type", header: "Request Type", render: r => <span className="text-sm font-medium text-white capitalize">{r.type}</span> },
    { key: "details", header: "Details", render: r => (
      <span className="text-xs text-admin-muted">
        {r.previousPlan && r.planName ? `${r.previousPlan} → ${r.planName}` : (r.planName || r.previousPlan || "N/A")}
      </span>
    )},
    { key: "date", header: "Date", render: r => <span className="text-xs text-admin-muted">{r.createdAt?.slice(0, 10)}</span> },
    { key: "status", header: "Status", render: r => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          r.status === "approved" ? "bg-green-500/10 text-green-400" :
          r.status === "rejected" ? "bg-red-500/10 text-red-400" :
          "bg-amber-500/10 text-amber-400"
        }`}>
          {r.status}
        </span>
    )},
    {
      key: "actions", header: "", align: "right",
      render: r => (
        <div className="flex justify-end gap-1.5">
          {r.status === "pending" && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setApproveReqTarget(r)} disabled={actionLoading}>
                <CheckCircle2 size={13} /> Approve
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRejectReqTarget(r)} disabled={actionLoading} title="Reject Request">
                <XCircle size={13} />
              </Button>
            </>
          )}
          <Button size="sm" variant="danger" onClick={() => handleDeleteRequest(r._id)} title="Delete Request Record">
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

      {requests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Client Plan Requests</h2>
          </div>
          <DataTable columns={reqCols} data={requests} rowKey={r => r._id} />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">All Orders</h2>
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
        <div className="flex justify-center mt-4">
          <Button variant="secondary" onClick={() => loadMore(50)}>Load more</Button>
        </div>
      )}
      {status === "LoadingMore" && <p className="text-center text-sm text-admin-muted mt-4">Loading…</p>}
      </div>

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

      {/* Approve Request confirmation */}
      <ConfirmDialog
        open={!!approveReqTarget}
        onClose={() => setApproveReqTarget(null)}
        onConfirm={handleApproveRequest}
        loading={actionLoading}
        title="Approve Plan Request?"
        description={`Approve the request for ${approveReqTarget?.clientName} to ${approveReqTarget?.type} their plan? NOTE: You must also manually update their actual plan status from the Orders or Users panel if required.`}
        confirmLabel="Approve"
      />

      {/* Reject Request confirmation */}
      <ConfirmDialog
        open={!!rejectReqTarget}
        onClose={() => setRejectReqTarget(null)}
        onConfirm={handleRejectRequest}
        loading={actionLoading}
        title="Reject Plan Request?"
        description={`Reject the request for ${approveReqTarget?.clientName}?`}
        confirmLabel="Reject"
      />
    </div>
  );
}
