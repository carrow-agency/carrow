import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, Plus, Trash2, Upload, Loader2,
} from "lucide-react";
import { useCreateMonthlyReport, useGenerateUploadUrl } from "../../../lib/useConvex";
import { Id } from "../../../../convex/_generated/dataModel";
import { toWebP } from "../../../lib/toWebP";

// ── Types ────────────────────────────────────────────────────────────────────
interface MediaItem {
  storageId: string | null;
  preview: string | null;
  stat: string;
  date: string;
  caption: string;
}

interface Props {
  clientId: string;
  clientName?: string;
  onClose: () => void;
}

// ── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: "period",     title: "Report Period",         sub: "Which month are you reporting on?" },
  { id: "kpis",       title: "Key Performance",       sub: "Top-line numbers for this month" },
  { id: "engagement", title: "Engagement",             sub: "How audiences interacted with content" },
  { id: "content",    title: "Content Breakdown",     sub: "Distribution and top-performing pieces" },
  { id: "insights",   title: "Strategic Insights",    sub: "Analysis and recommendations" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors";
const lbl = "block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2";

const slide = {
  initial: (d: number) => ({ opacity: 0, x: d > 0 ? 48 : -48 }),
  animate: { opacity: 1, x: 0 },
  exit:    (d: number) => ({ opacity: 0, x: d > 0 ? -48 : 48 }),
};

function emptyMedia(): MediaItem {
  return { storageId: null, preview: null, stat: "", date: "", caption: "" };
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ReportBuilder({ clientId, clientName, onClose }: Props) {
  const createReport = useCreateMonthlyReport();
  const generateUploadUrl = useGenerateUploadUrl();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [monthYear, setMonthYear] = useState("");
  const [kpi, setKpi] = useState({ totalViews: "", accountsReached: "", totalInteractions: "", profileVisits: "", totalContentPosted: "" });
  const [eng, setEng] = useState({ likes: "", comments: "", shares: "", saves: "" });
  const [ct, setCt] = useState({ reels: 0, stories: 0, posts: 0 });
  const [reels, setReels] = useState<MediaItem[]>([emptyMedia()]);
  const [posts, setPosts] = useState<MediaItem[]>([emptyMedia()]);
  const [hasPrev, setHasPrev] = useState(false);
  const [prev, setPrev] = useState({ views: "", reach: "", interactions: "" });
  const [ins, setIns] = useState({ performanceSummary: "", bestContentType: "", growthOpportunity: "" });

  const uploadThumb = async (rawFile: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(rawFile.type)) {
      return null;
    }
    const { blob, isConverted } = await toWebP(rawFile, 0.85);
    const finalMime = isConverted ? "image/webp" : rawFile.type;

    const url = await generateUploadUrl();
    const res = await fetch(url, { method: "POST", body: blob, headers: { "Content-Type": finalMime } });
    if (!res.ok) return null;
    const { storageId } = await res.json();
    return { storageId, preview: URL.createObjectURL(blob) };
  };

  const go = (delta: number) => {
    setDir(delta);
    setError("");
    setStep((s) => s + delta);
  };

  const validateCurrent = (): string | null => {
    if (step === 0 && !monthYear.trim()) return "Enter the month and year (e.g. Jan-26).";
    return null;
  };

  const handleNext = () => {
    const err = validateCurrent();
    if (err) { setError(err); return; }
    if (step < STEPS.length - 1) go(1);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const parseNum = (val: string | number) => {
        if (typeof val === "number") return val;
        const num = parseInt(val.replace(/,/g, ''), 10);
        return isNaN(num) ? 0 : num;
      };

      const parsedKpi = {
        totalViews: parseNum(kpi.totalViews),
        accountsReached: parseNum(kpi.accountsReached),
        totalInteractions: parseNum(kpi.totalInteractions),
        profileVisits: parseNum(kpi.profileVisits),
        totalContentPosted: parseNum(kpi.totalContentPosted),
      };

      const parsedEng = {
        likes: parseNum(eng.likes),
        comments: parseNum(eng.comments),
        shares: parseNum(eng.shares),
        saves: parseNum(eng.saves),
      };

      const parsedPrev = hasPrev ? {
        views: parseNum(prev.views),
        reach: parseNum(prev.reach),
        interactions: parseNum(prev.interactions),
      } : undefined;

      await createReport({
        clientId: clientId as Id<"users">,
        monthYear: monthYear.trim(),
        kpiCards: parsedKpi,
        contentType: ct,
        engagement: parsedEng,
        topReels: reels.map(r => ({ thumbnailStorageId: r.storageId as Id<"_storage"> ?? undefined, views: parseNum(r.stat), date: r.date, caption: r.caption || undefined })),
        topPosts: posts.map(p => ({ thumbnailStorageId: p.storageId as Id<"_storage"> ?? undefined, viewsOrReach: parseNum(p.stat), date: p.date, caption: p.caption || undefined })),
        strategicInsights: ins,
        previousMonth: parsedPrev,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-0 shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1">
              {clientName ? `Report · ${clientName}` : "Monthly Analysis"}
            </p>
            <h2 className="text-2xl font-bold text-white">{STEPS[step]?.title}</h2>
            <p className="text-sm text-white/40 mt-1">{STEPS[step]?.sub}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all mt-1">
            <X size={16} />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 px-8 py-5 shrink-0">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-white" : i < step ? "w-4 bg-white/40" : "w-4 bg-white/10"}`} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 shrink-0">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeInOut" }}>

              {/* Step 0: Period */}
              {step === 0 && (
                <div className="space-y-4">
                  <Field label="Month & Year">
                    <input value={monthYear} onChange={e => setMonthYear(e.target.value)} className={inp} placeholder="e.g. Jan-26" />
                    <p className="text-xs text-white/25 mt-2">This is shown to the client as the report folder name.</p>
                  </Field>
                </div>
              )}

              {/* Step 1: KPIs */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(kpi) as (keyof typeof kpi)[]).map(k => (
                    <Field key={k} label={humanize(k)}>
                      <input value={kpi[k]} onChange={e => setKpi({ ...kpi, [k]: e.target.value })} className={inp} placeholder="e.g. 1.2M" />
                    </Field>
                  ))}
                </div>
              )}

              {/* Step 2: Engagement */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(eng) as (keyof typeof eng)[]).map(k => (
                      <Field key={k} label={humanize(k)}>
                        <input value={eng[k]} onChange={e => setEng({ ...eng, [k]: e.target.value })} className={inp} placeholder="e.g. 45K" />
                      </Field>
                    ))}
                  </div>
                  <div className="border-t border-white/8 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-white/60">Previous month comparison</p>
                      <button onClick={() => setHasPrev(!hasPrev)} className={`w-10 h-5 rounded-full relative transition-colors ${hasPrev ? "bg-white" : "bg-white/15"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#111] transition-all ${hasPrev ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                    {hasPrev && (
                      <div className="grid grid-cols-3 gap-4">
                        {(Object.keys(prev) as (keyof typeof prev)[]).map(k => (
                          <Field key={k} label={humanize(k)}>
                            <input value={prev[k]} onChange={e => setPrev({ ...prev, [k]: e.target.value })} className={inp} placeholder="e.g. 800K" />
                          </Field>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Content */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <p className="text-sm font-semibold text-white mb-4">Content type breakdown (%)</p>
                    <div className="grid grid-cols-3 gap-4">
                      {(Object.keys(ct) as (keyof typeof ct)[]).map(k => (
                        <Field key={k} label={humanize(k)}>
                          <input type="number" min={0} max={100} value={ct[k]} onChange={e => setCt({ ...ct, [k]: Number(e.target.value) })} className={inp} placeholder="0" />
                        </Field>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/8 pt-6 space-y-6">
                    <MediaSection label="Top Reels" items={reels} setItems={setReels} statLabel="Views" uploadThumb={uploadThumb} aspectRatio="9/16" />
                    <MediaSection label="Top Posts" items={posts} setItems={setPosts} statLabel="Views / Reach" uploadThumb={uploadThumb} aspectRatio="1/1" />
                  </div>
                </div>
              )}

              {/* Step 4: Insights */}
              {step === 4 && (
                <div className="space-y-5">
                  <Field label="Performance Summary">
                    <textarea rows={4} value={ins.performanceSummary} onChange={e => setIns({ ...ins, performanceSummary: e.target.value })} className={inp} placeholder="Overall performance this month…" />
                  </Field>
                  <Field label="Best Content Type">
                    <input value={ins.bestContentType} onChange={e => setIns({ ...ins, bestContentType: e.target.value })} className={inp} placeholder="e.g. Reels" />
                  </Field>
                  <Field label="Growth Opportunity">
                    <textarea rows={4} value={ins.growthOpportunity} onChange={e => setIns({ ...ins, growthOpportunity: e.target.value })} className={inp} placeholder="Key areas to focus on next month…" />
                  </Field>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/8 bg-white/3 shrink-0">
          <button
            onClick={() => go(-1)}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#111] rounded-xl text-sm font-bold hover:bg-white/90 transition-all"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#111] rounded-xl text-sm font-bold hover:bg-white/90 disabled:opacity-50 transition-all"
            >
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Check size={15} /> Publish Report</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
    </div>
  );
}

function humanize(k: string) {
  return k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()).trim();
}

function MediaSection({
  label, items, setItems, statLabel, uploadThumb, aspectRatio,
}: {
  label: string;
  items: MediaItem[];
  setItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  statLabel: string;
  uploadThumb: (f: File) => Promise<{ storageId: string; preview: string } | null>;
  aspectRatio: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        <button
          onClick={() => setItems(p => [...p, emptyMedia()])}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors"
        >
          <Plus size={13} /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <MediaRow
            key={i}
            item={item}
            statLabel={statLabel}
            aspectRatio={aspectRatio}
            onThumb={async f => {
              const r = await uploadThumb(f);
              if (r) setItems(p => { const n = [...p]; n[i] = { ...n[i], ...r } as MediaItem; return n; });
            }}
            onChange={field => setItems(p => { const n = [...p]; n[i] = { ...n[i], ...field } as MediaItem; return n; })}
            onRemove={items.length > 1 ? () => setItems(p => p.filter((_, idx) => idx !== i)) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function MediaRow({
  item, statLabel, aspectRatio, onThumb, onChange, onRemove,
}: {
  item: MediaItem;
  statLabel: string;
  aspectRatio: string;
  onThumb: (f: File) => void;
  onChange: (f: Partial<MediaItem>) => void;
  onRemove?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const isReel = aspectRatio === "9/16";

  return (
    <div className="flex gap-3 items-start bg-white/4 border border-white/8 rounded-xl p-3">
      <div
        onClick={() => ref.current?.click()}
        className={`shrink-0 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/25 transition-colors overflow-hidden ${isReel ? "w-12 h-20" : "w-14 h-14"}`}
      >
        {item.preview
          ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
          : <Upload size={12} className="text-white/25" />
        }
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onThumb(f); }} />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label className={lbl}>{statLabel}</label>
          <input value={item.stat} onChange={e => onChange({ stat: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors" placeholder="e.g. 120K" />
        </div>
        <div>
          <label className={lbl}>Date</label>
          <input value={item.date} onChange={e => onChange({ date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors" placeholder="e.g. Jan 12" />
        </div>
        <div className="col-span-2">
          <label className={lbl}>Caption</label>
          <input value={item.caption} onChange={e => onChange({ caption: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors" placeholder="Optional" />
        </div>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-colors mt-0.5">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
