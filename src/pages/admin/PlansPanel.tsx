import { useState, useEffect } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { Modal } from "./components/Modal";
import { Input, Textarea } from "./components/Input";
import { Toggle } from "./components/Toggle";
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "../../lib/useConvex";
import { Check, Plus, Pencil, Trash2, X } from "lucide-react";

interface PlanData {
  id: string;
  name: string;
  price?: string;
  features: string[];
  isPopular?: boolean;
  visibility?: boolean;
  tagline?: string;
}

export default function PlansPanel() {
  const plans = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const [list, setList] = useState<PlanData[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: "", price: "", tagline: "", isPopular: false, visibility: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plans) {
      setList(plans);
    }
  }, [plans]);

  const openEdit = (i: number) => {
    const plan = list[i];
    setFormData({
      name: plan?.name || "",
      price: plan?.price || "",
      tagline: plan?.tagline || "",
      isPopular: plan?.isPopular || false,
      visibility: plan?.visibility ?? true,
    });
    setFeatures(plan?.features?.slice() || []);
    setEditing(i);
  };

  const openNew = () => {
    setFormData({ name: "", price: "", tagline: "", isPopular: false, visibility: true });
    setFeatures([]);
    setEditing(list.length);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const planData = {
        name: formData.name,
        price: formData.price,
        tagline: formData.tagline,
        features: features.filter(f => f.trim()),
        isPopular: formData.isPopular,
        visibility: formData.visibility,
      };
      
      const existingPlan = editing !== null && editing < list.length ? list[editing] : null;
      if (existingPlan) {
        await updatePlan({ id: existingPlan.id as any, ...planData });
      } else {
        await createPlan(planData);
      }
      setEditing(null);
    } catch (error) {
      console.error("Failed to save plan:", error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan({ id: id as any });
      } catch (error) {
        console.error("Failed to delete plan:", error);
      }
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      await updatePlan({ id: id as any, visibility: visible });
    } catch (error) {
      console.error("Failed to update visibility:", error);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Pricing"
        title="Plans"
        description="Curated subscription tiers offered to clients of the studio."
        actions={<Button onClick={openNew}><Plus size={14} /> New plan</Button>}
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {list.map((p, i) => (
          <div key={p.id || p.name + i} className={`relative flex flex-col overflow-hidden rounded-xl border bg-admin-surface p-8 transition-colors ${p.isPopular ? "border-white/40" : "border-admin-border"}`}>
            {p.isPopular && (
              <span className="absolute right-6 top-6 rounded-full border border-white/30 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                Most chosen
              </span>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-admin-muted">{p.name}</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl font-semibold tracking-tight">{p.price || "—"}</span>
              {p.price?.startsWith("$") && <span className="text-sm text-admin-muted">/ month</span>}
            </div>
            <p className="mt-4 text-sm text-admin-muted">{p.tagline}</p>

            <div className="my-7 h-px bg-admin-border" />

            <ul className="flex-1 space-y-3">
              {p.features?.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/90">
                  <Check size={15} className="mt-0.5 shrink-0 text-white" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center justify-between border-t border-admin-border pt-5">
              <Toggle
                checked={p.visibility ?? true}
                onChange={(v) => handleToggleVisibility(p.id, v)}
                label={p.visibility !== false ? "Visible" : "Hidden"}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(i)}><Pencil size={13} /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing !== null && editing < list.length ? `Edit ${list[editing]?.name}` : "New plan"}
        subtitle="Plans appear on the public pricing page."
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save plan"}</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-5">
          <Input 
            label="Plan name" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Pro" 
          />
          <Input 
            label="Price"     
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="$149 or 'Contact us'" 
          />
          <div className="col-span-2">
            <Textarea 
              label="Tagline" 
              value={formData.tagline}
              onChange={(e) => setFormData({...formData, tagline: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] text-admin-muted">Features</span>
            <Button size="sm" variant="ghost" onClick={() => setFeatures([...features, ""])}><Plus size={12} /> Add feature</Button>
          </div>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  className="h-11 flex-1 rounded-md border border-admin-border bg-admin-surface2 px-3.5 text-sm focus:border-white/40"
                  value={f}
                  onChange={(e) => setFeatures(features.map((x, xi) => xi === i ? e.target.value : x))}
                  placeholder="Describe a benefit"
                />
                <button onClick={() => setFeatures(features.filter((_, xi) => xi !== i))} className="rounded-md border border-admin-border p-2.5 text-admin-muted hover:text-white">
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 flex items-center gap-8 border-t border-admin-border pt-5">
          <Toggle 
            checked={formData.isPopular} 
            onChange={(v) => setFormData({...formData, isPopular: v})} 
            label="Mark as most popular" 
          />
          <Toggle 
            checked={formData.visibility} 
            onChange={(v) => setFormData({...formData, visibility: v})} 
            label="Visible on pricing page" 
          />
        </div>
      </Modal>
    </div>
  );
}
