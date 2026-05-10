import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { DataTable, Column } from "./components/DataTable";
import { Button } from "./components/Button";
import { StatsCard } from "./components/StatsCard";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useErrorLogs, useErrorStats, useResolveError, useDeleteError } from "../../lib/useConvex";
import { withErrorHandler } from "../../lib/mutationHandler";
import { Id } from "../../../convex/_generated/dataModel";
import { AlertCircle, CheckCircle, Trash2, RefreshCw, Server, Monitor } from "lucide-react";

interface ErrorData {
  id: string;
  message: string;
  stack: string;
  source: string;
  url: string;
  timestamp: string;
  resolved: boolean;
}

const TABS = ["All", "Unresolved", "Resolved"] as const;

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function ErrorsPanel() {
  const errorLogs    = useErrorLogs() ?? [];
  const stats        = useErrorStats();
  const resolveError = useResolveError();
  const deleteError  = useDeleteError();

  const [tab, setTab]           = useState<(typeof TABS)[number]>("Unresolved");
  const [resolving, setResolving] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ErrorData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "All")        return errorLogs;
    if (tab === "Unresolved") return errorLogs.filter(e => !e.resolved);
    return errorLogs.filter(e => e.resolved);
  }, [errorLogs, tab]);

  const handleResolve = async (id: string) => {
    await withErrorHandler(async () => {
      await resolveError({ id: id as Id<"errorLogs"> });
    }, (loading) => setResolving(loading ? id : null), { showSuccessToast: true, successMessage: "Error resolved" });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await withErrorHandler(async () => {
      await deleteError({ id: deleteTarget.id as Id<"errorLogs"> });
      setDeleteTarget(null);
    }, setDeleting, { showSuccessToast: true, successMessage: "Error log deleted" });
  };

  const cols: Column<ErrorData>[] = [
    {
      key: "status", header: "Status",
      render: e => e.resolved ? (
        <span className="flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle size={13} /> Resolved
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs text-admin-danger">
          <AlertCircle size={13} /> Active
        </span>
      ),
    },
    {
      key: "message", header: "Error",
      render: e => (
        <div className="max-w-md">
          <p className="text-sm font-medium text-white truncate">{e.message}</p>
          {e.stack && (
            <details className="mt-1">
              <summary className="text-xs text-admin-muted cursor-pointer hover:text-white transition-colors">Show stack</summary>
              <pre className="mt-2 p-3 rounded-lg bg-admin-surface2 border border-admin-border text-xs text-admin-muted overflow-x-auto max-h-28 whitespace-pre-wrap">
                {e.stack}
              </pre>
            </details>
          )}
          {e.url && <p className="text-[11px] text-admin-muted mt-0.5 truncate">{e.url}</p>}
        </div>
      ),
    },
    {
      key: "source", header: "Source",
      render: e => (
        <span className="flex items-center gap-1.5 text-xs text-admin-muted capitalize">
          {e.source === "frontend" ? <Monitor size={13} /> : <Server size={13} />}
          {e.source}
        </span>
      ),
    },
    {
      key: "time", header: "Time",
      render: e => <span className="text-xs text-admin-muted">{fmtDate(e.timestamp)}</span>,
    },
    {
      key: "actions", header: "", align: "right",
      render: e => (
        <div className="flex justify-end gap-1.5">
          {!e.resolved && (
            <Button
              size="sm" variant="secondary"
              onClick={() => handleResolve(e.id)}
              disabled={resolving === e.id}
            >
              {resolving === e.id ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Resolve
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(e)} title="Delete">
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Diagnostics"
        title="Error Logs"
        description="Track and resolve application errors from all sources."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total"      value={String(stats?.total      ?? 0)} icon={<AlertCircle size={15}/>} iconColor="text-white/30" />
        <StatsCard label="Unresolved" value={String(stats?.unresolved ?? 0)} icon={<AlertCircle size={15}/>} iconColor="text-admin-danger" />
        <StatsCard label="Frontend"   value={String(stats?.frontend   ?? 0)} icon={<Monitor     size={15}/>} iconColor="text-blue-400" />
        <StatsCard label="Backend"    value={String(stats?.backend    ?? 0)} icon={<Server      size={15}/>} iconColor="text-purple-400" />
      </div>

      <div className="flex items-center gap-2">
        {TABS.map(t => (
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

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface p-12 text-center">
          <CheckCircle size={28} className="mx-auto text-admin-muted mb-3" />
          <p className="text-sm text-admin-muted">No errors found — all systems operational</p>
        </div>
      ) : (
        <DataTable columns={cols} data={filtered} rowKey={e => e.id} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this error log?"
        description="The log entry will be permanently removed. This is irreversible."
        confirmLabel="Delete Log"
      />
    </div>
  );
}