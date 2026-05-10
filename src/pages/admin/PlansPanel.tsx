import { useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { Modal } from "./components/Modal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Input, Textarea } from "./components/Input";
import { Toggle } from "./components/Toggle";
import { usePlans, useAdminPlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "../../lib/useConvex";
import { withErrorHandler } from "../../lib/mutationHandler";
import { Id } from "../../../convex/_generated/dataModel";
import { Check, Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";

interface PlanData {
  id: string;
  name: string;
  price?: string;
  features: string[];
  isPopular?: boolean;
  visibility?: boolean;
  tagline?: string;
}

const EMPTY_FORM = { name: "", price: "", tagline: "", isPopular: false, visibility: true };

export default function PlansPanel() {
  const plans = useAdminPlans() ?? [];
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  // Use plan ID (not index) as editing key to avoid stale-index bugs
  const [editingId, setEditingId]   = useState<string | "new" | null>(null);
  const [features, setFeatures]     = useState<string[]>([]);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PlanData | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const openEdit = (plan: PlanData) => {
    setFormData({
      name: plan.name,
      price: plan.price || "",
      tagline: plan.tagline || "",
      isPopular: plan.isPopular || false,
      visibility: plan.visibility ?? true,
    });
    setFeatures(plan.features?.slice() || []);
    setEditingId(plan.id);
  };

  const openNew = () => {
    setFormData(EMPTY_FORM);
    setFeatures([]);
    setEditingId("new");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    await withErrorHandler(async () => {
      const payload = {
        name: formData.name,
        price: formData.price,
        tagline: formData.tagline,
        features: features.filter(f => f.trim()),
        isPopular: formData.isPopular,
        visibility: formData.visibility,
      };
      if (editingId === "new") {
        await createPlan(payload);
      } else {
        await updatePlan({ id: editingId as Id<"plans">, ...payload });
      }
      setEditingId(null);
    }, setSaving, { showSuccessToast: true, successMessage: editingId === "new" ? "Plan created" : "Plan updated" });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await withErrorHandler(async () => {
      await deletePlan({ id: deleteTarget.id as Id<"plans"> });
      setDeleteTarget(null);
    }, setDeleting, { showSuccessToast: true, successMessage: "Plan deleted" });
  };

  const handleToggleVisibility = async (plan: PlanData, visible: boolean) => {
    await withErrorHandler(async () => {
      await updatePlan({ id: plan.id as Id<"plans">, visibility: visible });
    }, undefined, { showSuccessToast: true, successMessage: `Plan marked as ${visible ? 'public' : 'hidden'}` });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pricing"
        title="Plans"
        description="Subscription tiers displayed on the public pricing page."
        actions={<Button onClick={openNew}><Plus size={14} /> New plan</Button>}
      />

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map(p => (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-xl border bg-admin-surface p-6 transition-colors ${
              p.visibility === false
                ? "border-admin-border opacity-50"
                : p.isPopular ? "border-white/30" : "border-admin-border"
            }`}
          >
            {p.visibility === false && (
              <span className="absolute left-5 top-5 flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                <EyeOff size={9} /> Hidden
              </span>
            )}
            {p.isPopular && p.visibility !== false && (
              <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-admin-bg">
                Popular
              </span>
            )}

            <p className="text-[10px] font-bold uppercase tracking-widest text-admin-muted">{p.name}</p>
            <p className="mt-3 text-4xl font-bold text-white tracking-tight">{p.price || "—"}</p>
            {p.price?.startsWith("$") && <p className="text-xs text-admin-muted">/ month</p>}
            {p.tagline && <p className="mt-2 text-sm text-admin-muted">{p.tagline}</p>}

            <div className="my-5 h-px bg-admin-border" />

            <ul className="flex-1 space-y-2.5">
              {p.features?.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check size={14} className="mt-0.5 shrink-0 text-admin-accent" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-admin-border pt-4">
              <button
                onClick={() => handleToggleVisibility(p, !(p.visibility ?? true))}
                className="flex items-center gap-1.5 text-xs text-admin-muted hover:text-white transition-colors"
                title={p.visibility !== false ? "Hide from pricing page" : "Show on pricing page"}
              >
                {p.visibility !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                {p.visibility !== false ? "Visible" : "Hidden"}
              </button>
              <div className="flex gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                  <Pencil size={12} /> Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(p)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-3 rounded-xl border border-admin-border bg-admin-surface p-12 text-center">
            <p className="text-admin-muted">No plans yet. Create your first plan.</p>
          </div>
        )}
      </section>

      {/* Edit / New modal */}
      <Modal
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        title={editingId === "new" ? "New plan" : `Edit plan`}
        subtitle="Changes appear on the public pricing page immediately."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
              {saving ? "Saving…" : "Save plan"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plan name"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Pro"
            />
            <Input
              label="Price"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              placeholder="$149 or 'Contact us'"
            />
            <div className="col-span-2">
              <Textarea
                label="Tagline"
                value={formData.tagline}
                onChange={e => setFormData({...formData, tagline: e.target.value})}
                placeholder="Best for growing brands…"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Features</span>
              <Button size="sm" variant="ghost" onClick={() => setFeatures([...features, ""])}>
                <Plus size={12} /> Add
              </Button>
            </div>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    className="h-10 flex-1 rounded-lg border border-admin-border bg-admin-surface2 px-3.5 text-sm text-white outline-none placeholder:text-admin-muted/60 focus:border-white/30"
                    value={f}
                    onChange={e => setFeatures(features.map((x, xi) => xi === i ? e.target.value : x))}
                    placeholder="Describe a benefit"
                  />
                  <button
                    onClick={() => setFeatures(features.filter((_, xi) => xi !== i))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-admin-border text-admin-muted hover:text-admin-danger hover:border-admin-danger/30 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-8 border-t border-admin-border pt-4">
            <Toggle
              checked={formData.isPopular}
              onChange={v => setFormData({...formData, isPopular: v})}
              label="Most popular"
            />
            <Toggle
              checked={formData.visibility}
              onChange={v => setFormData({...formData, visibility: v})}
              label="Visible on pricing page"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This plan will be removed permanently. Existing clients with this plan are unaffected."
        confirmLabel="Delete Plan"
      />
    </div>
  );
}
