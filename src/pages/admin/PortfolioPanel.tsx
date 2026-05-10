import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Toggle } from "./components/Toggle";
import { Select } from "./components/Input";
import {
  useWorksAll,
  useCreateWork,
  useUpdateWork,
  useDeleteWork,
  useGenerateUploadUrl,
  useUsers,
  useWorkMediaByWork,
  useAddWorkMedia,
  useRemoveWorkMedia,
} from "../../lib/useConvex";
import { withErrorHandler } from "../../lib/mutationHandler";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Globe,
  Lock,
  Search,
  ChevronLeft,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  Layout,
  User,
} from "lucide-react";

const CATEGORIES = ["Brand Identity", "Web Design", "Social Media", "Print", "Motion", "Content", "Photography"];
const MODES = [
  { id: "public" as const, label: "Public Portfolio", icon: Globe, desc: "Visible on the public Works page" },
  { id: "client" as const, label: "Client Media", icon: Lock, desc: "Only visible in that client's dashboard" },
];

type Mode = "public" | "client";

import { toWebP } from "../../lib/toWebP";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Small upload button ──────────────────────────────────────────────────────

function MediaUploadCell({
  workId,
  onAdd,
}: {
  workId: string;
  onAdd: (storageId: string, type: string) => Promise<void>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const generateUrl = useGenerateUploadUrl();
  const [uploading, setUploading] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { blob, isConverted } = await toWebP(file);
      const finalFile = isConverted ? new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }) : file;
      const url = await generateUrl();
      const res = await fetch(url, { method: "POST", body: finalFile, headers: { "Content-Type": finalFile.type } });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      await onAdd(storageId, finalFile.type);
    } catch (err) { console.error(err); }
    setUploading(false);
    if (ref.current) ref.current.value = "";
  };

  return (
    <>
      <input ref={ref} type="file" accept="image/*,video/*" className="hidden" onChange={handle} />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors disabled:opacity-40"
      >
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        {uploading ? "Uploading…" : "Add media"}
      </button>
    </>
  );
}

// ─── Work Media Strip ─────────────────────────────────────────────────────────

function WorkMediaStrip({ workId }: { workId: string }) {
  const media = useWorkMediaByWork(workId);
  const removeMedia = useRemoveWorkMedia();
  const addMedia = useAddWorkMedia();

  const handleAdd = useCallback(
    async (storageId: string, type: string) => {
      await addMedia({ workId: workId as Id<"works">, storageId, type, order: media.length });
    },
    [workId, addMedia, media.length]
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {media.map((m) => (
        <div key={m._id} className="group relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]">
          {m.url && m.type?.startsWith("image") ? (
            <img src={m.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#444]">
              <ImageIcon size={14} />
            </div>
          )}
          <button
            onClick={() => removeMedia({ id: m._id })}
            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          >
            <X size={12} className="text-red-400" />
          </button>
        </div>
      ))}
      <MediaUploadCell workId={workId} onAdd={handleAdd} />
    </div>
  );
}

// ─── Work Row (table row) ──────────────────────────────────────────────────────

function WorkRow({
  work,
  onEdit,
  onDelete,
  onTogglePublish,
  showUser,
}: {
  work: any;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: (v: boolean) => void;
  showUser?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-[#141414] hover:bg-[#0e0e0e] transition-colors group">
        <td className="p-3 w-14">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
            {work.url ? (
              <img src={work.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#333]">
                <ImageIcon size={14} />
              </div>
            )}
          </div>
        </td>
        <td className="p-3">
          <p className="text-sm font-medium text-white leading-tight">{work.title}</p>
          <p className="text-xs text-[#444] mt-0.5">{work.category}</p>
        </td>
        {showUser && (
          <td className="p-3">
            <p className="text-xs text-[#666]">{work.client || "—"}</p>
          </td>
        )}
        <td className="p-3">
          <Toggle checked={work.published ?? false} onChange={onTogglePublish} label={work.published ? "Live" : "Draft"} />
        </td>
        <td className="p-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[#444] hover:text-white transition-colors flex items-center gap-1"
          >
            <Layout size={12} />
            Media
          </button>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={showUser ? 6 : 5} className="bg-[#0a0a0a] px-4 py-3 border-b border-[#141414]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#333] mb-2">Additional media</p>
              <WorkMediaStrip workId={work.id} />
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Add/Edit modal ───────────────────────────────────────────────────────────

function WorkModal({
  mode,
  editingWork,
  onClose,
  onSave,
  users,
}: {
  mode: Mode;
  editingWork: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  users: any[];
}) {
  const generateUrl = useGenerateUploadUrl();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(editingWork?.url || null);
  const [storageId, setStorageId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: editingWork?.title || "",
    client: editingWork?.client || "",
    clientId: editingWork?.clientId || "",
    category: editingWork?.category || CATEGORIES[0],
    published: editingWork?.published ?? true,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const { blob, isConverted } = await toWebP(file);
      const finalFile = isConverted ? new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }) : file;
      const url = await generateUrl();
      const res = await fetch(url, { method: "POST", body: finalFile, headers: { "Content-Type": finalFile.type } });
      if (!res.ok) throw new Error();
      const { storageId: sid } = await res.json();
      setStorageId(sid);
    } catch { setPreviewUrl(null); setStorageId(null); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (!editingWork && !storageId) return;
    if (mode === "client" && !form.clientId) return;
    setSaving(true);
    const selectedUser = users.find(u => u.id === form.clientId);
    await onSave({
      title: form.title,
      client: mode === "client" ? (selectedUser?.name || form.client) : form.client,
      clientId: mode === "client" ? form.clientId : undefined,
      category: form.category,
      published: form.published,
      ...(storageId ? { url: storageId } : {}),
    });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-[#0d0d0d] border border-[#1c1c1c] rounded-2xl shadow-2xl z-10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#141414]">
          <div className="flex items-center gap-2.5">
            {mode === "public" ? <Globe size={16} className="text-[#555]" /> : <Lock size={16} className="text-[#555]" />}
            <p className="text-sm font-semibold text-white">
              {editingWork ? "Edit" : "Add"} {mode === "public" ? "portfolio item" : "client media"}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Cover image upload */}
          <div>
            <p className="text-xs font-medium text-[#555] uppercase tracking-wider mb-2">Cover image</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            {previewUrl ? (
              <div className="relative inline-block">
                <img src={previewUrl} alt="" className="w-full h-40 object-cover rounded-xl border border-[#1c1c1c]" />
                {uploading && (
                  <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                    <Loader2 size={20} className="text-white animate-spin" />
                  </div>
                )}
                <button
                  onClick={() => { setPreviewUrl(null); setStorageId(null); }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#555] hover:text-white transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1c1c1c] text-[#333] hover:border-[#2a2a2a] hover:text-[#555] transition-colors"
              >
                <Upload size={20} />
                <span className="text-xs">Click to upload cover image</span>
              </button>
            )}
          </div>

          {/* Title + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Project name"
                className="w-full h-10 rounded-lg bg-[#111] border border-[#1c1c1c] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#2a2a2a] px-3.5 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Category</label>
              <Select
                value={form.category}
                onChange={val => setForm(p => ({ ...p, category: val }))}
                options={CATEGORIES.map(c => ({ label: c, value: c }))}
                placeholder="Select category…"
                className="w-full"
              />
            </div>
            {mode === "public" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Client name</label>
                <input
                  value={form.client}
                  onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
                  placeholder="Optional"
                  className="w-full h-10 rounded-lg bg-[#111] border border-[#1c1c1c] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#2a2a2a] px-3.5 transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Client <span className="text-red-400">*</span></label>
                <Select
                  value={form.clientId}
                  onChange={val => setForm(p => ({ ...p, clientId: val }))}
                  options={users.map(u => ({ label: `${u.name} (${u.email})`, value: u.id }))}
                  placeholder="Select client…"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Publish toggle (only for public) */}
          {mode === "public" && (
            <div className="flex items-center justify-between py-3 border-t border-[#141414]">
              <div>
                <p className="text-sm text-white font-medium">Publish immediately</p>
                <p className="text-xs text-[#444] mt-0.5">Visible on the public Works page</p>
              </div>
              <Toggle checked={form.published} onChange={v => setForm(p => ({ ...p, published: v }))} label="" />
            </div>
          )}
        </div>

        <div className="flex gap-2.5 px-6 pb-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-[#1c1c1c] text-sm text-[#555] hover:text-white hover:border-[#2a2a2a] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading || !form.title || (!editingWork && !storageId) || (mode === "client" && !form.clientId)}
            className="flex-1 h-10 rounded-xl bg-white text-black text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {editingWork ? "Save changes" : "Add"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function PortfolioPanel() {
  const { works, status, loadMore } = useWorksAll() || { works: [], status: "Exhausted" as const, loadMore: () => {} };
  const createWork = useCreateWork();
  const updateWork = useUpdateWork();
  const deleteWork = useDeleteWork();
  const { users } = useUsers() || { users: [] };

  const [mode, setMode] = useState<Mode>("public");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allWorks = useMemo(() => works || [], [works]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allWorks.filter((w) => {
      const matchMode = mode === "public" ? !w.clientId : !!w.clientId;
      const matchSearch = !q || w.title.toLowerCase().includes(q) || (w.client || "").toLowerCase().includes(q);
      return matchMode && matchSearch;
    });
  }, [allWorks, mode, search]);

  const handleOpenNew = () => { setEditingWork(null); setModalOpen(true); };
  const handleOpenEdit = (w: any) => { setEditingWork(w); setModalOpen(true); };

  const handleSave = async (data: any) => {
    await withErrorHandler(async () => {
      if (editingWork) {
        await updateWork({ id: editingWork.id as Id<"works">, ...data });
      } else {
        await createWork({ ...data, isPrivate: mode === "client" });
      }
      setModalOpen(false);
    }, undefined, { showSuccessToast: true, successMessage: editingWork ? "Work updated" : "Work created" });
  };

  const handleTogglePublish = async (w: any, published: boolean) => {
    await withErrorHandler(async () => {
      await updateWork({ id: w.id as Id<"works">, published });
    }, undefined, { showSuccessToast: true, successMessage: `Work ${published ? 'published' : 'hidden'}` });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await withErrorHandler(async () => {
      await deleteWork({ id: deleteTarget.id as Id<"works"> });
      setDeleteTarget(null);
    }, setDeleting, { showSuccessToast: true, successMessage: "Work deleted" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Showcase"
        title="Portfolio"
        description="Manage public work and client-specific media."
        actions={<Button onClick={handleOpenNew}><Plus size={14} /> New {mode === "public" ? "work" : "client media"}</Button>}
      />

      {/* Mode switcher */}
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              mode === m.id
                ? "bg-white text-black border-white"
                : "bg-transparent text-[#555] border-[#1c1c1c] hover:text-white hover:border-[#2a2a2a]"
            }`}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="h-9 pl-8 pr-3 rounded-lg bg-[#0c0c0c] border border-[#1c1c1c] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#2a2a2a] transition-colors w-48"
          />
        </div>
      </div>

      {/* Mode description */}
      <div className="flex items-center gap-2 text-xs text-[#444] -mt-2">
        {mode === "public" ? <Globe size={12} /> : <Lock size={12} />}
        {MODES.find(m => m.id === mode)?.desc}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0c0c0c] border border-[#161616] rounded-2xl gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
            <ImageIcon size={20} className="text-[#333]" />
          </div>
          <p className="text-sm text-[#444]">No {mode === "public" ? "portfolio items" : "client media"} yet</p>
          <Button onClick={handleOpenNew}><Plus size={13} /> Add first</Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#141414] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#141414] bg-[#0c0c0c]">
                <th className="p-3 w-14" />
                <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#333]">Title</th>
                {mode === "client" && (
                  <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#333]">Client</th>
                )}
                <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#333]">Status</th>
                <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#333]">Media</th>
                <th className="p-3 w-20" />
              </tr>
            </thead>
            <tbody className="bg-[#090909]">
              {filtered.map((w) => (
                <WorkRow
                  key={w.id}
                  work={w}
                  onEdit={() => handleOpenEdit(w)}
                  onDelete={() => setDeleteTarget(w)}
                  onTogglePublish={(v) => handleTogglePublish(w, v)}
                  showUser={mode === "client"}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => loadMore(50)}>Load more</Button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <WorkModal
            mode={mode}
            editingWork={editingWork}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            users={users}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This will permanently remove the item and all associated media."
        confirmLabel="Delete"
      />
    </div>
  );
}