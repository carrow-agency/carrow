import { useState, useEffect } from "react";
import { PageHeader } from "./components/PageHeader";
import { Input, Textarea } from "./components/Input";
import { Button } from "./components/Button";
import { useSettings, useUpdateSettings } from "../../lib/useConvex";

const tabs = ["General", "Home page", "SEO"] as const;

export default function SettingsPanel() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const [tab, setTab] = useState<(typeof tabs)[number]>("General");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [general, setGeneral] = useState({
    siteName: "",
    tagline: "",
    email: "",
    whatsapp: "",
  });
  
  const [home, setHome] = useState({
    h1: "",
    h2: "",
    cta1: "",
    cta2: "",
  });
  
  const [seo, setSeo] = useState({
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    if (settings) {
      setGeneral({
        siteName: settings.general?.siteName || "",
        tagline: settings.general?.tagline || "",
        email: settings.general?.email || "",
        whatsapp: settings.general?.whatsapp || "",
      });
      setHome({
        h1: settings.home?.h1 || "",
        h2: settings.home?.h2 || "",
        cta1: settings.home?.cta1 || "",
        cta2: settings.home?.cta2 || "",
      });
      setSeo({
        seoTitle: settings.seoTitle || "",
        seoDescription: settings.seoDescription || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        general,
        home,
        seoTitle: seo.seoTitle,
        seoDescription: seo.seoDescription,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Site-wide configuration for Carrow's public surface and client communications."
        actions={<Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : saved ? "Saved!" : "Save changes"}</Button>}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`block w-full rounded-md px-4 py-2.5 text-left text-sm transition-colors ${
                tab === t ? "bg-admin-surface text-white" : "text-admin-muted hover:bg-white/5 hover:text-white"
              }`}
            >{t}</button>
          ))}
        </nav>

        <section className="rounded-xl border border-admin-border bg-admin-surface p-8">
          {tab === "General" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input 
                label="Site name" 
                value={general.siteName} 
                onChange={(e) => setGeneral({...general, siteName: e.target.value})}
              />
              <Input 
                label="Tagline"   
                value={general.tagline}
                onChange={(e) => setGeneral({...general, tagline: e.target.value})}
              />
              <Input 
                label="Contact email" 
                value={general.email}
                onChange={(e) => setGeneral({...general, email: e.target.value})}
              />
              <Input 
                label="WhatsApp number" 
                value={general.whatsapp}
                onChange={(e) => setGeneral({...general, whatsapp: e.target.value})}
              />
            </div>
          )}
          {tab === "Home page" && (
            <div className="grid grid-cols-1 gap-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input 
                  label="Hero H1" 
                  value={home.h1}
                  onChange={(e) => setHome({...home, h1: e.target.value})}
                />
                <Input 
                  label="Hero H2" 
                  value={home.h2}
                  onChange={(e) => setHome({...home, h2: e.target.value})}
                />
                <Input 
                  label="Primary CTA text" 
                  value={home.cta1}
                  onChange={(e) => setHome({...home, cta1: e.target.value})}
                />
                <Input 
                  label="Secondary CTA text" 
                  value={home.cta2}
                  onChange={(e) => setHome({...home, cta2: e.target.value})}
                />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted">Live preview</p>
                <div className="rounded-xl border border-admin-border bg-admin-bg p-12 text-center">
                  <h2 className="font-serif text-5xl tracking-tight">{home.h1 || "Your H1 here"}</h2>
                  <p className="mx-auto mt-4 max-w-md text-sm text-admin-muted">{home.h2 || "Your H2 here"}</p>
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <Button>{home.cta1 || "CTA 1"}</Button>
                    <Button variant="outline">{home.cta2 || "CTA 2"}</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "SEO" && (
            <div className="grid grid-cols-1 gap-6">
              <Input 
                label="SEO title" 
                value={seo.seoTitle}
                onChange={(e) => setSeo({...seo, seoTitle: e.target.value})}
              />
              <Textarea 
                label="SEO description" 
                value={seo.seoDescription}
                onChange={(e) => setSeo({...seo, seoDescription: e.target.value})}
              />
              <div className="rounded-md border border-admin-border bg-admin-surface2 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-admin-muted">Search preview</p>
                <p className="mt-2 text-sm text-[#8AB4F8]">carrow.com</p>
                <p className="font-display text-base text-white">{seo.seoTitle || "Your SEO title"}</p>
                <p className="text-xs text-admin-muted">Carrow Studio crafts identities and websites for ambitious founders…</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
