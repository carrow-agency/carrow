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

import { WorkRow } from "./portfolio/WorkRow";
import { WorkModal, type Mode } from "./portfolio/WorkModal";
import { Work, User } from "../../types";

const MODES = [
  { id: "public" as const, label: "Public Portfolio", icon: Globe, desc: "Visible on the public Works page" },
  { id: "client" as const, label: "Client Media", icon: Lock, desc: "Only visible in that client's dashboard" },
];

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
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Work | null>(null);
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
  const handleOpenEdit = (w: Work) => { setEditingWork(w); setModalOpen(true); };

  const handleSave = async (data: Partial<Work>) => {
    await withErrorHandler(async () => {
      if (editingWork) {
        await updateWork({ id: editingWork.id as Id<"works">, ...data });
      } else {
        await createWork({ ...data, isPrivate: mode === "client" } as Partial<Work>);
      }
      setModalOpen(false);
    }, undefined, { showSuccessToast: true, successMessage: editingWork ? "Work updated" : "Work created" });
  };

  const handleTogglePublish = async (w: Work, published: boolean) => {
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