import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, X, Globe, Lock, Upload } from "lucide-react";
import { Select } from "../components/Input";
import { Toggle } from "../components/Toggle";
import { useGenerateUploadUrl } from "../../../lib/useConvex";
import { toWebP } from "../../../lib/toWebP";

const CATEGORIES = ["Brand Identity", "Web Design", "Social Media", "Print", "Motion", "Content", "Photography"];
export type Mode = "public" | "client";

import { Work, User } from "../../../types";

export function WorkModal({
  mode,
  editingWork,
  onClose,
  onSave,
  users,
}: {
  mode: Mode;
  editingWork: Work | null;
  onClose: () => void;
  onSave: (data: Partial<Work>) => Promise<void>;
  users: User[];
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
    phone: editingWork?.phone || "",
    instagram: editingWork?.instagram || "",
    location: editingWork?.location || "",
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      phone: form.phone,
      instagram: form.instagram,
      location: form.location,
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

          {/* Optional Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+1 234..."
                className="w-full h-10 rounded-lg bg-[#111] border border-[#1c1c1c] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#2a2a2a] px-3.5 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Instagram</label>
              <input
                value={form.instagram}
                onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                placeholder="@username"
                className="w-full h-10 rounded-lg bg-[#111] border border-[#1c1c1c] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#2a2a2a] px-3.5 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Location</label>
              <input
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="City, Country"
                className="w-full h-10 rounded-lg bg-[#111] border border-[#1c1c1c] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#2a2a2a] px-3.5 transition-colors"
              />
            </div>
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
