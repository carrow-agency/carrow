import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { DataTable, Column } from "./components/DataTable";
import { Button } from "./components/Button";
import { StatsCard } from "./components/StatsCard";
import { useErrorLogs, useErrorStats, useResolveError, useDeleteError } from "../../lib/useConvex";
import { AlertCircle, CheckCircle, Trash2, X, RefreshCw, Server, Monitor } from "lucide-react";

interface ErrorData {
  id: string;
  message: string;
  stack: string;
  source: string;
  url: string;
  timestamp: string;
  resolved: boolean;
}

const tabs = ["All", "Unresolved", "Resolved"] as const;

export default function ErrorsPanel() {
  const errorLogs = useErrorLogs();
  const stats = useErrorStats();
  const resolveError = useResolveError();
  const deleteError = useDeleteError();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Unresolved");
  const [resolving, setResolving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredErrors = useMemo(() => {
    if (!errorLogs) return [];
    if (tab === "All") return errorLogs;
    if (tab === "Unresolved") return errorLogs.filter(e => !e.resolved);
    return errorLogs.filter(e => e.resolved);
  }, [errorLogs, tab]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResolve = async (errorId: string) => {
    setResolving(errorId);
    try {
      await resolveError({ id: errorId as any });
    } catch (err) {
      console.error("Failed to resolve:", err);
    }
    setResolving(null);
  };

  const handleDelete = async (errorId: string) => {
    if (!confirm("Delete this error log?")) return;
    setDeleting(errorId);
    try {
      await deleteError({ id: errorId as any });
    } catch (err) {
      console.error("Failed to delete:", err);
    }
    setDeleting(null);
  };

  const cols: Column<ErrorData>[] = [
    { key: "status", header: "Status", render: (e) => (
      e.resolved ? (
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle size={16} /> Resolved
        </span>
      ) : (
        <span className="flex items-center gap-2 text-red-600">
          <AlertCircle size={16} /> Active
        </span>
      )
    )},
    { key: "message", header: "Error", render: (e) => (
      <div className="max-w-md">
        <p className="font-medium text-gray-900 truncate">{e.message}</p>
        {e.stack && (
          <details className="mt-1">
            <summary className="text-xs text-gray-500 cursor-pointer">Show stack</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-32">
              {e.stack}
            </pre>
          </details>
        )}
      </div>
    )},
    { key: "source", header: "Source", render: (e) => (
      <span className="flex items-center gap-1 text-sm text-gray-600">
        {e.source === "frontend" ? <Monitor size={14} /> : <Server size={14} />}
        {e.source}
      </span>
    )},
    { key: "timestamp", header: "Time", render: (e) => (
      <span className="text-sm text-gray-500">{formatDate(e.timestamp)}</span>
    )},
    { key: "actions", header: "", align: "right", render: (e) => (
      <div className="flex justify-end gap-2">
        {!e.resolved && (
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => handleResolve(e.id)}
            disabled={resolving === e.id}
          >
            {resolving === e.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Resolve
          </Button>
        )}
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => handleDelete(e.id)}
          disabled={deleting === e.id}
        >
          {deleting === e.id ? <X size={14} className="animate-pulse" /> : <Trash2 size={14} />}
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Diagnostics"
        title="Error Logs"
        description="Track and resolve errors from your application."
      />

      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatsCard label="Total errors" value={String(stats?.total ?? 0)} />
        <StatsCard label="Unresolved" value={String(stats?.unresolved ?? 0)} />
        <StatsCard label="Frontend" value={String(stats?.frontend ?? 0)} />
        <StatsCard label="Backend" value={String(stats?.backend ?? 0)} />
      </section>

      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors ${
              tab === t
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >{t}</button>
        ))}
      </div>

      {filteredErrors.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <AlertCircle size={32} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">No errors found</p>
          <p className="mt-1 text-sm text-gray-400">All systems operational</p>
        </div>
      ) : (
        <DataTable columns={cols} data={filteredErrors} />
      )}
    </div>
  );
}