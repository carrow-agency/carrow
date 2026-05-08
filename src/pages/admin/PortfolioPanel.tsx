import { useState, useEffect } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { Modal } from "./components/Modal";
import { Input, Select } from "./components/Input";
import { Toggle } from "./components/Toggle";
import { FileUpload } from "./components/FileUpload";
import { useWorks } from "../../lib/useConvex";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface WorkData {
  id: string;
  url: string;
  title: string;
  category: string;
  client?: string;
  published?: boolean;
}

export default function PortfolioPanel() {
  const works = useWorks();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<WorkData[]>([]);

  useEffect(() => {
    if (works) {
      setItems(works);
    }
  }, [works]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Showcase"
        title="Portfolio"
        description="The body of work presented on Carrow's public-facing site. Curate carefully."
        actions={<Button onClick={() => setOpen(true)}><Plus size={14} /> New work</Button>}
      />

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((w, i) => (
          <article key={w.title} className="group flex flex-col overflow-hidden rounded-xl border border-admin-border bg-admin-surface transition-colors hover:border-white/20">
            <div className="relative aspect-[4/5] overflow-hidden bg-admin-surface2">
              <div
                className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: `radial-gradient(circle at 30% 30%, #2a2a2a 0%, #111 60%, #0a0a0a 100%)`,
                }}
              />
              <span className="absolute left-4 top-4 rounded-full border border-admin-border bg-admin-bg/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted backdrop-blur">
                {w.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <div>
                <h3 className="font-display text-base font-semibold tracking-tight text-white">{w.title}</h3>
                <p className="mt-1 text-xs text-admin-muted">{w.client}</p>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-admin-border pt-4">
                <Toggle
                  checked={w.published ?? false}
                  onChange={(v) => setItems(items.map((x, xi) => xi === i ? { ...x, published: v } : x))}
                  label={w.published ? "Published" : "Draft"}
                />
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost"><Pencil size={13} /></Button>
                  <Button size="sm" variant="ghost"><Trash2 size={13} /></Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add new work"
        subtitle="Publish a project to your public portfolio."
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Save work</Button>
        </>}
      >
        <div className="space-y-6">
          <FileUpload />
          <div className="grid grid-cols-2 gap-5">
            <Input label="Title" placeholder="Project title" />
            <Input label="Client" placeholder="Client name" />
            <Select label="Category">
              <option>Brand Identity</option>
              <option>Web Design</option>
              <option>Social Media</option>
              <option>Print</option>
              <option>Motion</option>
            </Select>
            <div className="flex items-end"><Toggle checked onChange={() => {}} label="Publish on save" /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
