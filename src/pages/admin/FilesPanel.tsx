import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { StatsCard } from "./components/StatsCard";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ClientFileCard } from "./components/ClientFileCard";
import { UploadZone } from "./components/UploadZone";
import { ReportBuilder } from "./components/ReportBuilder";
import {
  useAllFiles,
  useClientFiles,
  useUsers,
  useMonthlyReportsByUser,
  useDeleteMonthlyReport,
} from "../../lib/useConvex";
import {
  FileText,
  Image as ImageIcon,
  BarChart2,
  FolderOpen,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  File,
} from "lucide-react";

// ─── constants ───────────────────────────────────────────────────────────────
const FILE_TABS = ["All", "Contract", "Report", "Media", "Monthly Analysis"] as const;
type FileTab = (typeof FILE_TABS)[number];

const TAB_LABELS: Record<FileTab, string> = {
  "All": "All Files",
  "Contract": "Contracts",
  "Report": "Reports",
  "Media": "Media",
  "Monthly Analysis": "Monthly Analysis",
};

function formatDate(ts?: string | number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── component ───────────────────────────────────────────────────────────────
export default function FilesPanel() {
  const [tab, setTab] = useState<FileTab>("All");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  // Data
  const { users } = useUsers() || { users: [] };
  const allFiles = useAllFiles() ?? [];
  const clientFiles = useClientFiles(selectedUserId || undefined);
  const monthlyReports = useMonthlyReportsByUser(selectedUserId || null);
  const deleteMonthlyReport = useDeleteMonthlyReport();

  // Selected client info
  const selectedUser = users?.find((u) => u.id === selectedUserId);

  // Filtered + sorted clients
  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    return (users ?? [])
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, clientSearch]);

  // File counts per client for sidebar badges
  const fileCountByUser = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of allFiles) {
      map[f.userId as string] = (map[f.userId as string] ?? 0) + 1;
    }
    return map;
  }, [allFiles]);

  // Filtered files for current tab
  const filteredFiles = useMemo(() => {
    if (!clientFiles) return [];
    if (tab === "All") return clientFiles;
    if (tab === "Monthly Analysis") return [];
    return clientFiles.filter((f) => {
      const label = f.fileLabel ?? (f.type.startsWith("image/") ? "Media" : "Report");
      return label === tab;
    });
  }, [clientFiles, tab]);

  // Stats
  const stats = useMemo(() => ({
    contracts:       (clientFiles ?? []).filter((f) => f.fileLabel === "Contract").length,
    reports:         (clientFiles ?? []).filter((f) => f.fileLabel === "Report").length,
    media:           (clientFiles ?? []).filter((f) => f.fileLabel === "Media" || f.type.startsWith("image/")).length,
    monthlyAnalysis: monthlyReports?.length ?? 0,
    total:           (clientFiles?.length ?? 0) + (monthlyReports?.length ?? 0),
  }), [clientFiles, monthlyReports]);

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Delete this monthly analysis report? This cannot be undone.")) return;
    await deleteMonthlyReport({ id: id as any });
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <PageHeader
        eyebrow="Client Management"
        title="Files"
        description="Upload, manage, and organize documents and reports for each client."
        actions={
          selectedUserId ? (
            tab === "Monthly Analysis" ? (
              <Button onClick={() => setShowReportBuilder(true)}>
                <Plus size={14} />
                Generate Report
              </Button>
            ) : (
              <Button onClick={() => setShowUpload((v) => !v)}>
                <Plus size={14} />
                {showUpload ? "Hide Upload" : "Upload File"}
              </Button>
            )
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1 min-h-0">

        {/* ── Left: Client Sidebar ── */}
        <aside className="flex flex-col rounded-xl border border-admin-border bg-admin-surface overflow-hidden">
          {/* Search */}
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

          {/* Client List */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredClients.length === 0 && (
              <p className="text-center text-xs text-admin-muted py-10">No clients found</p>
            )}
            {filteredClients.map((u) => {
              const count = fileCountByUser[u.id] ?? 0;
              const isActive = selectedUserId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUserId(u.id); setTab("All"); setShowUpload(false); }}
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
                  {count > 0 && (
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-admin-bg/20 text-admin-bg" : "bg-white/10 text-white/60"
                    }`}>
                      {count}
                    </span>
                  )}
                  <ChevronRight size={12} className={`shrink-0 ${isActive ? "text-admin-bg/40" : "text-white/20"}`} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Right: Files Area ── */}
        <section className="flex flex-col gap-5 min-h-0">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-admin-border bg-admin-surface">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-admin-border bg-admin-surface2 text-white/10">
                  <FolderOpen size={28} />
                </div>
                <p className="text-sm font-medium text-white">Select a client</p>
                <p className="text-xs text-admin-muted">Choose a client from the sidebar to manage their files.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                <StatsCard label="Total" value={String(stats.total)} icon={<FolderOpen size={14} />} iconColor="text-white/30" />
                <StatsCard label="Contracts" value={String(stats.contracts)} icon={<FileText size={14} />} iconColor="text-blue-400" />
                <StatsCard label="Reports" value={String(stats.reports)} icon={<BarChart2 size={14} />} iconColor="text-green-400" />
                <StatsCard label="Media" value={String(stats.media)} icon={<ImageIcon size={14} />} iconColor="text-purple-400" />
                <StatsCard label="Analysis" value={String(stats.monthlyAnalysis)} icon={<BarChart2 size={14} />} iconColor="text-emerald-400" />
              </div>

              {/* Upload Zone (collapsible) */}
              {showUpload && tab !== "Monthly Analysis" && (
                <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
                  <h3 className="text-xs font-semibold text-admin-muted uppercase tracking-wider mb-4">
                    Upload for {selectedUser?.name || "Client"}
                  </h3>
                  <UploadZone
                    targetUserId={selectedUserId}
                    onSuccess={() => setShowUpload(false)}
                  />
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {FILE_TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                      tab === t
                        ? "border-white bg-white text-admin-bg"
                        : "border-admin-border bg-admin-surface text-admin-muted hover:text-white hover:border-white/20"
                    }`}
                  >
                    {TAB_LABELS[t]}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto min-h-0">

                {/* Monthly Analysis Tab */}
                {tab === "Monthly Analysis" && (
                  <div>
                    {monthlyReports === undefined ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      </div>
                    ) : monthlyReports.length === 0 ? (
                      <EmptyState
                        icon={<BarChart2 size={24} />}
                        title="No analysis reports yet"
                        description={`Generate the first report for ${selectedUser?.name || "this client"}.`}
                        action={
                          <Button size="sm" onClick={() => setShowReportBuilder(true)}>
                            <Plus size={13} /> Generate Report
                          </Button>
                        }
                      />
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

                {/* File Tabs */}
                {tab !== "Monthly Analysis" && (
                  <div>
                    {clientFiles === null ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      </div>
                    ) : filteredFiles.length === 0 ? (
                      <EmptyState
                        icon={<File size={24} />}
                        title={`No ${TAB_LABELS[tab].toLowerCase()} for this client`}
                        description="Upload a file using the button above."
                        action={
                          <Button size="sm" onClick={() => setShowUpload(true)}>
                            <Plus size={13} /> Upload File
                          </Button>
                        }
                      />
                    ) : (
                      <div className="space-y-2">
                        {filteredFiles.map((f) => (
                          <ClientFileCard key={f._id} file={f as any} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          )}
        </section>
      </div>

      {/* Report Builder Drawer */}
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

// ─── sub-components ──────────────────────────────────────────────────────────
function EmptyState({
  icon, title, description, action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-admin-border bg-admin-surface gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-admin-border bg-admin-surface2 text-admin-muted">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-admin-muted mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}

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
        <p className="text-[11px] text-admin-muted mt-0.5">Monthly Analysis · {formatDate(report._creationTime)}</p>
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
