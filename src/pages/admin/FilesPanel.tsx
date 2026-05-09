import { useMemo, useState, useRef } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { StatsCard } from "./components/StatsCard";
import { Select } from "./components/Input";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useAllFiles, useGenerateUploadUrl, useSaveClientFile, useDeleteClientFile, useUsers } from "../../lib/useConvex";
import { FileText, Image as ImageIcon, FileBarChart, Download, Trash2, Upload, FolderOpen } from "lucide-react";

const TYPE_TABS = ["All", "Contract", "Report", "Media"] as const;

const iconFor = (t: string) =>
  t === "Contract" ? FileText : t === "Report" ? FileBarChart : ImageIcon;

const formatSize = (b?: number) => {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function FilesPanel() {
  const [tab, setTab]               = useState<(typeof TYPE_TABS)[number]>("All");
  const [uploading, setUploading]   = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; storageId: string; name: string } | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const files             = useAllFiles() ?? [];
  const { users }         = useUsers() || { users: [] };
  const generateUploadUrl = useGenerateUploadUrl();
  const saveClientFile    = useSaveClientFile();
  const deleteClientFile  = useDeleteClientFile();

  const filtered = useMemo(() => {
    if (tab === "All") return files;
    if (tab === "Media") return files.filter(f => f.type?.startsWith("image/") || f.type === "Media");
    return files.filter(f => f.type === tab);
  }, [files, tab]);

  const stats = useMemo(() => ({
    total:     files.length,
    contracts: files.filter(f => f.type === "Contract").length,
    reports:   files.filter(f => f.type === "Report").length,
    media:     files.filter(f => f.type?.startsWith("image/") || f.type === "Media").length,
  }), [files]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedUserId) {
      alert("Please select a client before uploading.");
      return;
    }
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST", body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      const fileType = file.type.startsWith("image/") ? "Media"
        : file.type === "application/pdf" ? "Contract"
        : "Report";
      await saveClientFile({
        storageId,
        userId: selectedUserId as any,
        type: fileType,
        name: file.name,
        size: file.size,
      });
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteClientFile({ id: deleteTarget.id as any, storageId: deleteTarget.storageId as any }); }
    catch (err) { console.error(err); alert("Delete failed."); }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Storage"
        title="Files"
        description="Documents, contracts and media shared across client engagements."
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
              onChange={handleUpload}
            />
            <Button
              onClick={() => {
                if (!selectedUserId) {
                  alert("Select a client below before uploading.");
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload file"}
            </Button>
          </>
        }
      />

      {/* Client selector for upload */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
          Upload destination
        </p>
        <div className="max-w-sm">
          <Select
            label=""
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
          >
            <option value="">— Select client for upload —</option>
            {users?.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </Select>
        </div>
        {!selectedUserId && (
          <p className="mt-2 text-xs text-amber-400">⚠ Select a client before uploading a file</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total files" value={String(stats.total)}     icon={<FolderOpen size={15}/>}   iconColor="text-white/30" />
        <StatsCard label="Contracts"   value={String(stats.contracts)} icon={<FileText size={15}/>}     iconColor="text-blue-400" />
        <StatsCard label="Reports"     value={String(stats.reports)}   icon={<FileBarChart size={15}/>} iconColor="text-green-400" />
        <StatsCard label="Media"       value={String(stats.media)}     icon={<ImageIcon size={15}/>}    iconColor="text-purple-400" />
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-2">
        {TYPE_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
              tab === t
                ? "border-white bg-white text-admin-bg"
                : "border-admin-border bg-admin-surface text-admin-muted hover:text-white hover:border-white/20"
            }`}
          >
            {t === "All" ? "All files" : `${t}s`}
          </button>
        ))}
      </div>

      {/* File grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface p-12 text-center">
          <FolderOpen size={28} className="mx-auto text-admin-muted mb-3" />
          <p className="text-sm text-admin-muted">No files found</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(f => {
            const Icon = iconFor(f.type);
            return (
              <article
                key={f._id}
                className="flex items-center gap-4 rounded-xl border border-admin-border bg-admin-surface p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-surface2 text-admin-muted">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{f.name}</p>
                  <p className="text-xs text-admin-muted mt-0.5">
                    {f.type} · {formatSize(f.size)} · {formatDate(f.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {f.url && (
                    <a
                      href={f.url}
                      download={f.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-admin-muted hover:bg-white/5 hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download size={13} />
                    </a>
                  )}
                  <button
                    onClick={() => setDeleteTarget({ id: f._id, storageId: f.storageId, name: f.name })}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-danger/10 hover:text-admin-danger transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This file will be permanently deleted from storage and cannot be recovered."
        confirmLabel="Delete File"
      />
    </div>
  );
}
