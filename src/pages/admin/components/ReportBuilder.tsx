import { useState, useRef } from "react";
import { X, Plus, Trash2, Upload, Loader2, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { useCreateMonthlyReport, useGenerateUploadUrl } from "../../../lib/useConvex";

// ─── types ────────────────────────────────────────────────────────────────────
interface ReelEntry {
  thumbnailStorageId: string | null;
  thumbnailPreview: string | null;
  views: string;
  date: string;
  caption: string;
}

interface PostEntry {
  thumbnailStorageId: string | null;
  thumbnailPreview: string | null;
  viewsOrReach: string;
  date: string;
  caption: string;
}

interface Props {
  clientId: string;
  clientName?: string;
  onClose: () => void;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const SECTIONS = ["Info", "KPIs", "Engagement", "Content", "Insights"] as const;
type Section = (typeof SECTIONS)[number];

const inputCls =
  "w-full bg-admin-surface border border-admin-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors";

const labelCls = "block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5";

// ─── component ────────────────────────────────────────────────────────────────
export function ReportBuilder({ clientId, clientName, onClose }: Props) {
  const createReport   = useCreateMonthlyReport();
  const generateUploadUrl = useGenerateUploadUrl();

  const [activeSection, setActiveSection] = useState<Section>("Info");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  // ── Section: Info ──
  const [monthYear, setMonthYear] = useState("");

  // ── Section: KPIs ──
  const [kpiCards, setKpiCards] = useState({
    totalViews: "",
    accountsReached: "",
    totalInteractions: "",
    profileVisits: "",
    totalContentPosted: "",
  });

  // ── Section: Engagement ──
  const [engagement, setEngagement] = useState({
    likes: "",
    comments: "",
    shares: "",
    saves: "",
  });

  // ── Section: Content ──
  const [contentType, setContentType] = useState({ reels: 0, stories: 0, posts: 0 });
  const [topReels, setTopReels] = useState<ReelEntry[]>([
    { thumbnailStorageId: null, thumbnailPreview: null, views: "", date: "", caption: "" },
  ]);
  const [topPosts, setTopPosts] = useState<PostEntry[]>([
    { thumbnailStorageId: null, thumbnailPreview: null, viewsOrReach: "", date: "", caption: "" },
  ]);

  // ── Section: Insights ──
  const [insights, setInsights] = useState({
    performanceSummary: "",
    bestContentType: "",
    growthOpportunity: "",
  });
  const [hasPrevMonth, setHasPrevMonth] = useState(false);
  const [prevMonth, setPrevMonth] = useState({ views: "", reach: "", interactions: "" });

  // ── Upload thumbnail to Convex storage ──────────────────────────────────────
  const uploadThumbnail = async (file: File): Promise<{ storageId: string; preview: string } | null> => {
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      const preview = URL.createObjectURL(file);
      return { storageId, preview };
    } catch {
      return null;
    }
  };

  const handleReelThumb = async (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadThumbnail(file);
    if (result) {
      setTopReels((prev) => {
        const n = [...prev];
        n[i] = { ...n[i], thumbnailStorageId: result.storageId, thumbnailPreview: result.preview };
        return n;
      });
    }
  };

  const handlePostThumb = async (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadThumbnail(file);
    if (result) {
      setTopPosts((prev) => {
        const n = [...prev];
        n[i] = { ...n[i], thumbnailStorageId: result.storageId, thumbnailPreview: result.preview };
        return n;
      });
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setError("");
    if (!monthYear.trim()) {
      setError("Month & Year is required (e.g. Jan-26).");
      setActiveSection("Info");
      return;
    }

    setSaving(true);
    try {
      await createReport({
        clientId: clientId as any,
        monthYear: monthYear.trim(),
        kpiCards,
        contentType,
        engagement,
        topReels: topReels.map(({ thumbnailStorageId, views, date, caption }) => ({
          thumbnailStorageId: thumbnailStorageId as any ?? undefined,
          views,
          date,
          caption: caption || undefined,
        })),
        topPosts: topPosts.map(({ thumbnailStorageId, viewsOrReach, date, caption }) => ({
          thumbnailStorageId: thumbnailStorageId as any ?? undefined,
          viewsOrReach,
          date,
          caption: caption || undefined,
        })),
        strategicInsights: insights,
        previousMonth: hasPrevMonth ? prevMonth : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save report.");
      setSaving(false);
    }
  };

  const sectionIndex = SECTIONS.indexOf(activeSection);
  const isLast = sectionIndex === SECTIONS.length - 1;

  const goNext = () => {
    if (!isLast) setActiveSection(SECTIONS[sectionIndex + 1]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-2xl bg-admin-sidebar border-l border-admin-border h-full shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-admin-border bg-admin-surface2 shrink-0">
          <div>
            <p className="text-[11px] font-semibold text-admin-muted uppercase tracking-widest">Monthly Analysis</p>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {clientName ? `Report for ${clientName}` : "Generate Report"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-admin-muted hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Section Nav */}
        <div className="flex items-center gap-0 border-b border-admin-border bg-admin-surface2 px-6 shrink-0 overflow-x-auto">
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeSection === s
                  ? "border-white text-white"
                  : "border-transparent text-admin-muted hover:text-white"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                activeSection === s ? "bg-white text-admin-bg" : "bg-white/10 text-white/50"
              }`}>
                {i + 1}
              </span>
              {s}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 shrink-0">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Info ─────────────────────────────────────────────────────── */}
          {activeSection === "Info" && (
            <div className="space-y-4">
              <SectionTitle>Report Period</SectionTitle>
              <Field label="Month & Year">
                <input
                  type="text"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Jan-26"
                />
                <p className="text-xs text-admin-muted mt-1">
                  This label is shown to the client as the report folder name.
                </p>
              </Field>
            </div>
          )}

          {/* ── KPIs ─────────────────────────────────────────────────────── */}
          {activeSection === "KPIs" && (
            <div className="space-y-4">
              <SectionTitle>Key Performance Indicators</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(kpiCards) as (keyof typeof kpiCards)[]).map((k) => (
                  <Field key={k} label={humanize(k)}>
                    <input
                      type="text"
                      value={kpiCards[k]}
                      onChange={(e) => setKpiCards({ ...kpiCards, [k]: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. 1.2M"
                    />
                  </Field>
                ))}
              </div>
            </div>
          )}

          {/* ── Engagement ───────────────────────────────────────────────── */}
          {activeSection === "Engagement" && (
            <div className="space-y-6">
              <div>
                <SectionTitle>Engagement Metrics</SectionTitle>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {(Object.keys(engagement) as (keyof typeof engagement)[]).map((k) => (
                    <Field key={k} label={humanize(k)}>
                      <input
                        type="text"
                        value={engagement[k]}
                        onChange={(e) => setEngagement({ ...engagement, [k]: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. 45.2K"
                      />
                    </Field>
                  ))}
                </div>
              </div>

              <Divider />

              <div>
                <SectionTitle>Previous Month (optional)</SectionTitle>
                <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
                  <div
                    onClick={() => setHasPrevMonth(!hasPrevMonth)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${hasPrevMonth ? "bg-white" : "bg-white/20"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-admin-bg transition-all ${hasPrevMonth ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-sm text-admin-muted">Include comparison data</span>
                </label>

                {hasPrevMonth && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {(Object.keys(prevMonth) as (keyof typeof prevMonth)[]).map((k) => (
                      <Field key={k} label={humanize(k)}>
                        <input
                          type="text"
                          value={prevMonth[k]}
                          onChange={(e) => setPrevMonth({ ...prevMonth, [k]: e.target.value })}
                          className={inputCls}
                          placeholder="e.g. 800K"
                        />
                      </Field>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Content ──────────────────────────────────────────────────── */}
          {activeSection === "Content" && (
            <div className="space-y-8">
              {/* Content Type Breakdown */}
              <div>
                <SectionTitle>Content Type Breakdown (%)</SectionTitle>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {(Object.keys(contentType) as (keyof typeof contentType)[]).map((k) => (
                    <Field key={k} label={humanize(k)}>
                      <input
                        type="number"
                        min={0} max={100}
                        value={contentType[k]}
                        onChange={(e) => setContentType({ ...contentType, [k]: Number(e.target.value) })}
                        className={inputCls}
                        placeholder="0"
                      />
                    </Field>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Top Reels */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>Top Reels</SectionTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTopReels((p) => [...p, { thumbnailStorageId: null, thumbnailPreview: null, views: "", date: "", caption: "" }])}
                  >
                    <Plus size={13} /> Add Reel
                  </Button>
                </div>
                <div className="space-y-3">
                  {topReels.map((reel, i) => (
                    <MediaEntryRow
                      key={i}
                      type="reel"
                      preview={reel.thumbnailPreview}
                      onThumbChange={(e) => handleReelThumb(e, i)}
                      fields={[
                        { label: "Views", value: reel.views, placeholder: "e.g. 1.5M", onChange: (v) => setTopReels((p) => { const n = [...p]; n[i] = { ...n[i], views: v }; return n; }) },
                        { label: "Date", value: reel.date, placeholder: "e.g. Jan 12", onChange: (v) => setTopReels((p) => { const n = [...p]; n[i] = { ...n[i], date: v }; return n; }) },
                        { label: "Caption", value: reel.caption, placeholder: "Optional", onChange: (v) => setTopReels((p) => { const n = [...p]; n[i] = { ...n[i], caption: v }; return n; }) },
                      ]}
                      onRemove={topReels.length > 1 ? () => setTopReels((p) => p.filter((_, idx) => idx !== i)) : undefined}
                    />
                  ))}
                </div>
              </div>

              <Divider />

              {/* Top Posts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>Top Posts</SectionTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTopPosts((p) => [...p, { thumbnailStorageId: null, thumbnailPreview: null, viewsOrReach: "", date: "", caption: "" }])}
                  >
                    <Plus size={13} /> Add Post
                  </Button>
                </div>
                <div className="space-y-3">
                  {topPosts.map((post, i) => (
                    <MediaEntryRow
                      key={i}
                      type="post"
                      preview={post.thumbnailPreview}
                      onThumbChange={(e) => handlePostThumb(e, i)}
                      fields={[
                        { label: "Views / Reach", value: post.viewsOrReach, placeholder: "e.g. 30K", onChange: (v) => setTopPosts((p) => { const n = [...p]; n[i] = { ...n[i], viewsOrReach: v }; return n; }) },
                        { label: "Date", value: post.date, placeholder: "e.g. Jan 22", onChange: (v) => setTopPosts((p) => { const n = [...p]; n[i] = { ...n[i], date: v }; return n; }) },
                        { label: "Caption", value: post.caption, placeholder: "Optional", onChange: (v) => setTopPosts((p) => { const n = [...p]; n[i] = { ...n[i], caption: v }; return n; }) },
                      ]}
                      onRemove={topPosts.length > 1 ? () => setTopPosts((p) => p.filter((_, idx) => idx !== i)) : undefined}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Insights ─────────────────────────────────────────────────── */}
          {activeSection === "Insights" && (
            <div className="space-y-5">
              <SectionTitle>Strategic Insights</SectionTitle>
              <Field label="Performance Summary">
                <textarea
                  value={insights.performanceSummary}
                  onChange={(e) => setInsights({ ...insights, performanceSummary: e.target.value })}
                  rows={4}
                  className={inputCls}
                  placeholder="Describe overall performance this month…"
                />
              </Field>
              <Field label="Best Content Type">
                <input
                  type="text"
                  value={insights.bestContentType}
                  onChange={(e) => setInsights({ ...insights, bestContentType: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Reels"
                />
              </Field>
              <Field label="Growth Opportunity">
                <textarea
                  value={insights.growthOpportunity}
                  onChange={(e) => setInsights({ ...insights, growthOpportunity: e.target.value })}
                  rows={4}
                  className={inputCls}
                  placeholder="Key areas to improve or capitalize on next month…"
                />
              </Field>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-admin-border bg-admin-surface2 shrink-0">
          <button
            onClick={() => sectionIndex > 0 && setActiveSection(SECTIONS[sectionIndex - 1])}
            disabled={sectionIndex === 0}
            className="text-xs font-semibold text-admin-muted hover:text-white disabled:opacity-30 transition-colors"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            {isLast ? (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CheckCircle size={14} /> Save Report</>}
              </Button>
            ) : (
              <Button size="sm" onClick={goNext}>
                Next <ChevronRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── helper components ────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-white">{children}</h3>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-admin-border" />;
}

function humanize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

interface FieldSpec {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}

function MediaEntryRow({
  type,
  preview,
  onThumbChange,
  fields,
  onRemove,
}: {
  type: "reel" | "post";
  preview: string | null;
  onThumbChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fields: FieldSpec[];
  onRemove?: () => void;
}) {
  const thumbRef = useRef<HTMLInputElement>(null);
  const isReel = type === "reel";

  return (
    <div className="flex gap-3 items-start p-3 rounded-xl border border-admin-border bg-admin-surface2">
      {/* Thumbnail */}
      <div
        onClick={() => thumbRef.current?.click()}
        className={`shrink-0 rounded-lg border border-admin-border bg-admin-surface overflow-hidden flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors relative ${
          isReel ? "w-16 h-24" : "w-16 h-16"
        }`}
      >
        {preview ? (
          <img src={preview} alt="Thumbnail" className="w-full h-full object-cover" />
        ) : (
          <Upload size={14} className="text-admin-muted" />
        )}
        <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={onThumbChange} />
      </div>

      {/* Fields */}
      <div className="flex-1 grid grid-cols-2 gap-2">
        {fields.map((f) => (
          <div key={f.label} className={f.label === "Caption" ? "col-span-2" : ""}>
            <label className="block text-[10px] font-semibold text-admin-muted uppercase tracking-wider mb-1">{f.label}</label>
            <input
              type="text"
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              className="w-full bg-admin-surface border border-admin-border rounded-md px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-admin-muted hover:bg-red-500/10 hover:text-red-400 transition-colors mt-0.5"
          title="Remove"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
