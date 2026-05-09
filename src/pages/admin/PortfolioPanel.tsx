import { useState, useMemo, useRef } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { Modal } from "./components/Modal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Input, Select } from "./components/Input";
import { Toggle } from "./components/Toggle";
import { useWorksAll, useCreateWork, useUpdateWork, useDeleteWork, useGenerateUploadUrl } from "../../lib/useConvex";
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from "lucide-react";

interface WorkData {
  id: string;
  url: string;
  title: string;
  category: string;
  client?: string;
  published?: boolean;
}

const CATEGORIES = ["Brand Identity", "Web Design", "Social Media", "Print", "Motion"];

export default function PortfolioPanel() {
  const { works, status, loadMore } = useWorksAll() || { works: [], status: "Exhausted" as const, loadMore: () => {} };
  const createWork      = useCreateWork();
  const updateWork      = useUpdateWork();
  const deleteWork      = useDeleteWork();
  const generateUploadUrl = useGenerateUploadUrl();
  const fileInputRef    = useRef<HTMLInputElement>(null);

  const [open, setOpen]             = useState(false);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkData | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // Separate preview URL and storageId so <img> always has a valid src
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [storageId, setStorageId]       = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [formData, setFormData] = useState({
    title: "", client: "", category: CATEGORIES[0], published: true,
  });

  const items: WorkData[] = useMemo(() => works || [], [works]);

  const handleOpenNew = () => {
    setFormData({ title: "", client: "", category: CATEGORIES[0], published: true });
    setPreviewUrl(null);
    setStorageId(null);
    setEditingId(null);
    setOpen(true);
  };

  const handleOpenEdit = (w: WorkData) => {
    setFormData({ title: w.title, client: w.client || "", category: w.category, published: w.published ?? false });
    setPreviewUrl(w.url);   // existing URL — valid for <img>
    setStorageId(null);     // no new upload yet
    setEditingId(w.id);
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      // Create local blob URL for instant preview
      setPreviewUrl(URL.createObjectURL(file));
      // Upload and get storageId
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", body: file, headers: { "Content-Type": file.type } });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId: sid } = await res.json();
      setStorageId(sid);       // store for save
    } catch (err) {
      console.error(err);
      alert("Image upload failed.");
      setPreviewUrl(null);
      setStorageId(null);
    }
    setUploadingImg(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { alert("Please enter a title."); return; }
    if (!editingId && !storageId) { alert("Please upload an image."); return; }
    setSaving(true);
    try {
      if (editingId) {
        await updateWork({
          id: editingId as any,
          title: formData.title,
          client: formData.client,
          category: formData.category,
          published: formData.published,
          ...(storageId ? { url: storageId } : {}),
        });
      } else {
        await createWork({
          title: formData.title,
          client: formData.client,
          category: formData.category,
          url: storageId!,
          published: formData.published,
        });
      }
      setOpen(false);
    } catch (err) { console.error(err); alert("Save failed."); }
    setSaving(false);
  };

  const handleTogglePublish = async (w: WorkData, published: boolean) => {
    try { await updateWork({ id: w.id as any, published }); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteWork({ id: deleteTarget.id as any }); }
    catch (err) { console.error(err); }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Showcase"
        title="Portfolio"
        description="Work displayed on Carrow's public site. Curate carefully."
        actions={<Button onClick={handleOpenNew}><Plus size={14} /> New work</Button>}
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface p-12 text-center">
          <ImageIcon size={28} className="mx-auto text-admin-muted mb-3" />
          <p className="text-sm text-admin-muted">No portfolio items yet</p>
          <Button onClick={handleOpenNew} className="mt-4"><Plus size={14} /> Add first work</Button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(w => (
            <article key={w.id} className="group flex flex-col overflow-hidden rounded-xl border border-admin-border bg-admin-surface hover:border-white/20 transition-colors">
              <div className="relative aspect-[4/5] overflow-hidden bg-admin-surface2">
                {w.url ? (
                  <img
                    src={w.url}
                    alt={w.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon size={24} className="text-admin-muted" />
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur">
                  {w.category}
                </span>
                <span className={`absolute right-3 top-3 h-2 w-2 rounded-full ${w.published ? "bg-admin-accent" : "bg-admin-muted"}`} title={w.published ? "Published" : "Draft"} />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-white leading-tight">{w.title}</h3>
                  {w.client && <p className="text-xs text-admin-muted mt-0.5">{w.client}</p>}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-admin-border pt-3">
                  <Toggle
                    checked={w.published ?? false}
                    onChange={v => handleTogglePublish(w, v)}
                    label={w.published ? "Published" : "Draft"}
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(w)} title="Edit">
                      <Pencil size={12} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(w)} title="Delete">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => loadMore(50)}>Load more</Button>
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit work" : "Add new work"}
        subtitle="Manage a project in your public portfolio."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save work"}</Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Image upload */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Image</p>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            {previewUrl ? (
              <div className="relative inline-block">
                <img src={previewUrl} alt="Preview" className="h-44 w-44 rounded-xl object-cover border border-admin-border" />
                {uploadingImg && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                    <span className="text-xs text-white">Uploading…</span>
                  </div>
                )}
                <button
                  onClick={() => { setPreviewUrl(null); setStorageId(null); }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-admin-surface border border-admin-border text-admin-muted hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImg}
                className="flex h-44 w-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-admin-border text-admin-muted hover:border-white/30 hover:text-white transition-colors"
              >
                <Plus size={20} />
                <span className="mt-1.5 text-xs">{uploadingImg ? "Uploading…" : "Click to upload"}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Title"    value={formData.title}    onChange={e => setFormData({...formData, title: e.target.value})}    placeholder="Project name" />
            <Input label="Client"   value={formData.client}   onChange={e => setFormData({...formData, client: e.target.value})}   placeholder="Client name" />
            <Select label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div className="flex items-end pb-1">
              <Toggle checked={formData.published} onChange={v => setFormData({...formData, published: v})} label="Publish immediately" />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This portfolio item will be permanently removed from your public site."
        confirmLabel="Delete Work"
      />
    </div>
  );
}