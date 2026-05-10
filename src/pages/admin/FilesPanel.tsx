import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ReportBuilder } from "./components/ReportBuilder";
import {
  useUsers,
  useMonthlyReportsByUser,
  useDeleteMonthlyReport,
} from "../../lib/useConvex";
import {
  BarChart2,
  FolderOpen,
  Search,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";

function formatDate(ts?: string | number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Monthly report card ──────────────────────────────────────────────────────
function MonthlyReportCard({
  report,
  onDelete,
}: {
  report: { _id: string; monthYear: string; _creationTime: number };
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-admin-border bg-admin-surface px-4 py-3 hover:border-white/20 transition-all">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-surface2">
        <FolderOpen size={18} className="text-emerald-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white leading-tight">{report.monthYear}</p>
        <p className="text-[11px] text-admin-muted mt-0.5">Generated {formatDate(report._creationTime)}</p>
      </div>
      <button
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-admin-muted hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FilesPanel() {
  const [clientSearch, setClientSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  const { users } = useUsers() || { users: [] };
  const monthlyReports = useMonthlyReportsByUser(selectedUserId || null);
  const deleteMonthlyReport = useDeleteMonthlyReport();

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    return (users ?? [])
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, clientSearch]);

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Delete this monthly analysis report? This cannot be undone.")) return;
    await deleteMonthlyReport({ id: id as any });
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <PageHeader
        eyebrow="Client Management"
        title="Analysis Reports"
        description="Generate and manage monthly analysis reports for each client."
        actions={
          selectedUserId ? (
            <Button onClick={() => setShowReportBuilder(true)}>
              <Plus size={14} />
              Generate Report
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1 min-h-0">

        {/* ── Left: Client Sidebar ── */}
        <aside className="flex flex-col rounded-xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="p-3 border-b border-admin-border bg-admin-surface2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-admin-border bg-admin-surface text-admin-muted focus-within:border-white/30 focus-within:text-white transition-colors">
              <Search size={13} />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search clients…"
                className="flex-1 bg-transparent text-xs text-white placeholder:text-admin-muted outline-none"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredClients.length === 0 && (
              <p className="text-center text-xs text-admin-muted py-10">No clients found</p>
            )}
            {filteredClients.map((u) => {
              const isActive = selectedUserId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUserId(u.id); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                    isActive
                      ? "bg-white text-admin-bg"
                      : "text-admin-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase ${
                    isActive ? "bg-admin-bg text-white" : "bg-white/10 text-white"
                  }`}>
                    {u.name ? u.name.split(" ").map((p) => p[0]).slice(0, 2).join("") : "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">{u.name || "Unknown"}</p>
                    <p className={`truncate text-[11px] mt-0.5 ${isActive ? "text-admin-bg/60" : "text-white/40"}`}>
                      {u.email}
                    </p>
                  </div>
                  <ChevronRight size={12} className={`shrink-0 ${isActive ? "text-admin-bg/40" : "text-white/20"}`} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Right: Reports Area ── */}
        <section className="flex flex-col gap-5 min-h-0">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-admin-border bg-admin-surface">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-admin-border bg-admin-surface2 text-white/10">
                  <FolderOpen size={28} />
                </div>
                <p className="text-sm font-medium text-white">Select a client</p>
                <p className="text-xs text-admin-muted">Choose a client to view and generate their reports.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-admin-muted uppercase tracking-widest font-semibold">
                    {selectedUser?.name || "Client"}
                  </p>
                  <p className="text-sm text-white mt-0.5">
                    {monthlyReports?.length ?? 0} report{(monthlyReports?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Reports list */}
              {monthlyReports === undefined ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                </div>
              ) : monthlyReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-admin-border bg-admin-surface gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-admin-border bg-admin-surface2 text-admin-muted">
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">No reports yet</p>
                    <p className="text-xs text-admin-muted mt-1">
                      Generate the first report for {selectedUser?.name || "this client"}.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setShowReportBuilder(true)}>
                    <Plus size={13} /> Generate Report
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {monthlyReports.map((report) => (
                    <MonthlyReportCard
                      key={report._id}
                      report={report}
                      onDelete={() => handleDeleteReport(report._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {showReportBuilder && selectedUserId && (
        <ReportBuilder
          clientId={selectedUserId}
          clientName={selectedUser?.name}
          onClose={() => setShowReportBuilder(false)}
        />
      )}
    </div>
  );
}
