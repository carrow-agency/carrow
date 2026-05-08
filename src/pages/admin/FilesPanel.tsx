import { useMemo, useState } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { StatsCard } from "./components/StatsCard";
import { useClientFiles } from "../../lib/useConvex";
import { FileText, Image as ImageIcon, FileBarChart, Download, Trash2, Upload } from "lucide-react";

const tabs = ["All", "Contract", "Report", "Media"] as const;

const iconFor = (t: string) =>
  t === "Contract" ? FileText : t === "Report" ? FileBarChart : ImageIcon;

// Mock data for display - replace with useClientFiles when needed
const mockFiles = [
  { name: "Master Service Agreement.pdf", type: "Contract", uploader: "Aman Verma", date: "May 04, 2026", size: "412 KB" },
  { name: "Brand Audit Q2.pdf", type: "Report", uploader: "Sara Ahmed", date: "May 03, 2026", size: "2.1 MB" },
  { name: "Hero Render v3.png", type: "Media", uploader: "Lukas Müller", date: "May 03, 2026", size: "8.4 MB" },
  { name: "Statement of Work.pdf", type: "Contract", uploader: "Mia Tanaka", date: "May 02, 2026", size: "318 KB" },
];

export default function FilesPanel() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const files = useClientFiles();
  const data = useMemo(() => mockFiles.filter(f => tab === "All" || f.type === tab), [tab]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Storage"
        title="Files"
        description="Documents, contracts and media shared across client engagements."
        actions={<Button><Upload size={14} /> Upload file</Button>}
      />

      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatsCard label="Total files" value={String(mockFiles.length)} />
        <StatsCard label="Contracts" value={String(mockFiles.filter(f => f.type === "Contract").length)} />
        <StatsCard label="Reports"   value={String(mockFiles.filter(f => f.type === "Report").length)} />
        <StatsCard label="Storage used" value="42.7 GB" hint="of 200 GB plan" />
      </section>

      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors ${
              tab === t ? "border-white bg-white text-black"
                        : "border-admin-border bg-admin-surface text-admin-muted hover:text-white"
            }`}
          >{t === "All" ? "All files" : t + "s"}</button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.map((f) => {
          const Icon = iconFor(f.type);
          return (
            <article key={f.name} className="flex items-center gap-4 rounded-xl border border-admin-border bg-admin-surface p-5 transition-colors hover:border-white/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-admin-border bg-admin-surface2 text-admin-muted">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{f.name}</p>
                <p className="mt-0.5 text-xs text-admin-muted">
                  {f.type} · {f.size} · {f.date}
                </p>
                <p className="mt-1 text-xs text-admin-muted">by {f.uploader}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button size="sm" variant="ghost"><Download size={13} /></Button>
                <Button size="sm" variant="ghost"><Trash2 size={13} /></Button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
