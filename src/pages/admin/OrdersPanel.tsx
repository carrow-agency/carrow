import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { DataTable, Column } from "./components/DataTable";
import { StatusBadge } from "./components/StatusBadge";
import { StatsCard } from "./components/StatsCard";
import { Button } from "./components/Button";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "../../lib/useConvex";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";

interface OrderData {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  date: string;
  status: "Pending" | "Active" | "Cancelled";
}

export default function OrdersPanel() {
  const orders = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [tab, setTab] = useState<"All"|"Pending"|"Active"|"Cancelled">("All");
  
  const data = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => tab === "All" || o.status === tab);
  }, [orders, tab]);

  const totalOrders = orders?.length ?? 0;
  const pendingOrders = orders?.filter(o => o.status === "Pending").length ?? 0;
  const activeOrders = orders?.filter(o => o.status === "Active").length ?? 0;
  const cancelledOrders = orders?.filter(o => o.status === "Cancelled").length ?? 0;

  const handleActivate = async (order: OrderData) => {
    try {
      await updateOrderStatus({ 
        id: order.id as any, 
        status: "Active",
      });
    } catch (error) {
      console.error("Failed to activate order:", error);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await updateOrderStatus({ id: orderId as any, status: "Cancelled" });
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder({ id: orderId as any });
      } catch (error) {
        console.error("Failed to delete order:", error);
      }
    }
  };

  const cols: Column<OrderData>[] = [
    { key: "id", header: "Order", render: (o) => <span className="font-mono text-xs text-white">{o.id}</span> },
    { key: "client", header: "Client", render: (o) => (
      <div>
        <p className="font-medium text-white">{o.clientName}</p>
        <p className="text-xs text-admin-muted">{o.clientEmail}</p>
      </div>
    )},
    { key: "plan", header: "Plan", render: (o) => <span className="text-white/90">{o.plan}</span> },
    { key: "date", header: "Date", render: (o) => <span className="text-admin-muted">{o.date}</span> },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "act", header: "", align: "right", render: (o) => (
      <div className="flex justify-end gap-2">
        {o.status === "Pending" && (
          <Button size="sm" variant="secondary" onClick={() => handleActivate(o)}><CheckCircle2 size={14} /> Activate</Button>
        )}
        {o.status !== "Cancelled" && (
          <Button size="sm" variant="ghost" onClick={() => handleCancel(o.id)}><XCircle size={14} /></Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => handleDelete(o.id)}><Trash2 size={14} /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Subscription orders and plan upgrades from across the studio."
      />

      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatsCard label="Total orders" value={String(totalOrders)} />
        <StatsCard label="Pending"      value={String(pendingOrders)} />
        <StatsCard label="Active"       value={String(activeOrders)} />
        <StatsCard label="Cancelled"    value={String(cancelledOrders)} />
      </section>

      <div className="flex items-center gap-2">
        {(["All","Pending","Active","Cancelled"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors ${
              tab === t ? "border-white bg-white text-black"
                        : "border-admin-border bg-admin-surface text-admin-muted hover:text-white"
            }`}
          >{t}</button>
        ))}
      </div>

      <DataTable columns={cols} data={data} />
    </div>
  );
}
