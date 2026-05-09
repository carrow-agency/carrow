import { useState, useEffect } from "react";
import { PageHeader } from "./components/PageHeader";
import { Input, Textarea } from "./components/Input";
import { Button } from "./components/Button";
import { useSettings, useUpdateSettings } from "../../lib/useConvex";
import { CheckCircle2 } from "lucide-react";

const TABS = ["General", "Home page", "SEO"] as const;

export default function SettingsPanel() {
  const settings       = useSettings();
  const updateSettings = useUpdateSettings();
  const [tab, setTab]  = useState<(typeof TABS)[number]>("General");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const [general, setGeneral] = useState({ siteName: "", tagline: "", email: "", whatsapp: "" });
  const [home, setHome]       = useState({ h1: "", h2: "", cta1: "", cta2: "" });
  const [seo, setSeo]         = useState({ seoTitle: "", seoDescription: "" });

  useEffect(() => {
    if (!settings) return;
    setGeneral({
      siteName: settings.general?.siteName || "",
      tagline:  settings.general?.tagline  || "",
      email:    settings.general?.email    || "",
      whatsapp: settings.general?.whatsapp || "",
    });
    setHome({
      h1:   settings.home?.h1   || "",
      h2:   settings.home?.h2   || "",
      cta1: settings.home?.cta1 || "",
      cta2: settings.home?.cta2 || "",
    });
    setSeo({
      seoTitle:       settings.seoTitle       || "",
      seoDescription: settings.seoDescription || "",
    });
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ general, home, seoTitle: seo.seoTitle, seoDescription: seo.seoDescription });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Site-wide configuration for Carrow's public surface and client communications."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : saved ? <><CheckCircle2 size={14} /> Saved</> : "Save changes"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        {/* Sidebar nav */}
        <nav className="space-y-0.5">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white text-admin-bg"
                  : "text-admin-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
          {tab === "General" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input label="Site name"       value={general.siteName} onChange={e => setGeneral({...general, siteName: e.target.value})} />
              <Input label="Tagline"         value={general.tagline}  onChange={e => setGeneral({...general, tagline: e.target.value})} />
              <Input label="Contact email"   value={general.email}    onChange={e => setGeneral({...general, email: e.target.value})} type="email" />
              <Input label="WhatsApp number" value={general.whatsapp} onChange={e => setGeneral({...general, whatsapp: e.target.value})} placeholder="+1234567890" />
            </div>
          )}

          {tab === "Home page" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input label="Hero H1"             value={home.h1}   onChange={e => setHome({...home, h1: e.target.value})} />
                <Input label="Hero H2 / subtitle"  value={home.h2}   onChange={e => setHome({...home, h2: e.target.value})} />
                <Input label="Primary CTA text"    value={home.cta1} onChange={e => setHome({...home, cta1: e.target.value})} />
                <Input label="Secondary CTA text"  value={home.cta2} onChange={e => setHome({...home, cta2: e.target.value})} />
              </div>

              {/* Live preview */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Live Preview</p>
                <div className="rounded-xl border border-admin-border bg-admin-surface2 p-10 text-center">
                  <h2 className="font-serif text-4xl text-white tracking-tight">{home.h1 || "Your headline here"}</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm text-admin-muted">{home.h2 || "Your subtitle here"}</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <span className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-admin-bg">{home.cta1 || "CTA 1"}</span>
                    <span className="rounded-lg border border-admin-border px-5 py-2.5 text-sm font-medium text-white">{home.cta2 || "CTA 2"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "SEO" && (
            <div className="space-y-5">
              <Input
                label="SEO title"
                value={seo.seoTitle}
                onChange={e => setSeo({...seo, seoTitle: e.target.value})}
                placeholder="Carrow — Digital Agency"
              />
              <Textarea
                label="SEO description"
                value={seo.seoDescription}
                onChange={e => setSeo({...seo, seoDescription: e.target.value})}
                placeholder="Describe your site for search engines…"
              />

              {/* Search preview — shows actual seo state */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Search Preview</p>
                <div className="rounded-xl border border-admin-border bg-admin-surface2 p-5">
                  <p className="text-xs text-admin-accent">carrow.com</p>
                  <p className="mt-1 text-base font-medium text-white">{seo.seoTitle || "Your SEO title"}</p>
                  <p className="mt-1 text-sm text-admin-muted line-clamp-2">{seo.seoDescription || "Your SEO description will appear here…"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
