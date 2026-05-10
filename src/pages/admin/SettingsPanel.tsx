import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Globe,
  LayoutTemplate,
  Users,
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
  Mail,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronRight,
  GripVertical,
  Camera,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../lib/generated/api";
import { toWebP } from "../../lib/toWebP";
import {
  useSettings,
  useUpdateSettings,
  useTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useClearSettings,
} from "../../lib/useConvex";
import { withErrorHandler } from "../../lib/mutationHandler";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Id } from "../../../convex/_generated/dataModel";

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "general" | "content" | "team" | "danger";

interface TeamMember {
  _id?: string;
  name: string;
  role: string;
  tag: string;
  bio: string;
  image: string;
  order?: number;
}

const EMPTY_MEMBER: TeamMember = { name: "", role: "", tag: "team", bio: "", image: "" };

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 py-5 border-b border-[#1e1e1e] last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-[#555]">{hint}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AdminInput({
  label, value, onChange, placeholder, type = "text", icon,
}: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-[#555] uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 rounded-lg bg-[#111] border border-[#1e1e1e] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#333] focus:bg-[#141414] transition-all ${icon ? "pl-9 pr-4" : "px-3.5"}`}
        />
      </div>
    </div>
  );
}

function AdminTextarea({ label, value, onChange, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-[#555] uppercase tracking-wider">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg bg-[#111] border border-[#1e1e1e] text-sm text-white placeholder:text-[#333] outline-none focus:border-[#333] focus:bg-[#141414] transition-all px-3.5 py-2.5 resize-none"
      />
    </div>
  );
}

function SaveBar({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="sticky bottom-0 z-10 pt-6">
      <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl px-5 py-3.5">
        <p className="text-xs text-[#444]">Unsaved changes will be lost on navigation.</p>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />Saving</span>
          ) : saved ? (
            <span className="flex items-center gap-2"><Check size={14} />Saved</span>
          ) : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Team Member Card ─────────────────────────────────────────────────────────

function MemberCard({ member, onEdit, onDelete }: {
  member: TeamMember & { _id: string }; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-center gap-4 p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors"
    >
      <div className="text-[#2a2a2a] group-hover:text-[#3a3a3a] cursor-grab transition-colors">
        <GripVertical size={16} />
      </div>
      <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#222] flex-shrink-0 overflow-hidden">
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={16} className="text-[#333]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{member.name}</p>
          {member.tag && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#444] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded-full">
              {member.tag}
            </span>
          )}
        </div>
        <p className="text-xs text-[#444] truncate mt-0.5">{member.role}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Member Drawer ────────────────────────────────────────────────────────────

function MemberDrawer({ member, onSave, onClose }: {
  member: TeamMember; onSave: (m: TeamMember) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<TeamMember>(member);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handlePhotoClick = () => fileRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { blob, isConverted } = await toWebP(file);
      const finalFile = isConverted ? new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }) : file;
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": finalFile.type }, body: finalFile });
      const { storageId } = await res.json();
      // Build a direct storage URL for preview
      const convexUrl = uploadUrl.split("/api/storage/")[0];
      const previewUrl = `${convexUrl}/api/storage/${storageId}`;
      setForm(prev => ({ ...prev, image: previewUrl }));
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
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
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm bg-[#0d0d0d] border border-[#1c1c1c] rounded-2xl p-6 shadow-2xl z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <p className="text-sm font-semibold text-white">{form._id ? "Edit member" : "Add member"}</p>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Photo upload — center stage */}
        <div className="flex flex-col items-center mb-7">
          <button
            type="button"
            onClick={handlePhotoClick}
            className="relative w-24 h-24 rounded-full bg-[#111] border-2 border-dashed border-[#222] overflow-hidden group hover:border-[#333] transition-colors"
          >
            {form.image ? (
              <img src={form.image} alt="" className="w-full h-full object-cover" />
            ) : null}
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity ${
              form.image ? "opacity-0 group-hover:opacity-100 bg-black/60" : "opacity-100"
            }`}>
              {uploading ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <>
                  <Camera size={18} className="text-[#555] group-hover:text-white transition-colors" />
                  {!form.image && <span className="text-[10px] text-[#444]">Upload</span>}
                </>
              )}
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="mt-2.5 text-xs text-[#444]">Click to upload photo</p>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <AdminInput
            label="Full name"
            value={form.name}
            onChange={v => setForm(p => ({ ...p, name: v }))}
            placeholder="Jane Doe"
          />
          <AdminInput
            label="Role"
            value={form.role}
            onChange={v => setForm(p => ({ ...p, role: v }))}
            placeholder="Creative Director"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-7">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-[#1c1c1c] text-sm text-[#555] hover:text-white hover:border-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name || !form.role || saving || uploading}
            className="flex-1 h-10 rounded-xl bg-white text-black text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {form._id ? "Save" : "Add"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Tab navigation ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Globe size={15} /> },
  { id: "content", label: "Home Page", icon: <LayoutTemplate size={15} /> },
  { id: "about", label: "About Page", icon: <Users size={15} /> },
  { id: "team", label: "Team", icon: <Users size={15} /> },
  { id: "danger", label: "Danger Zone", icon: <AlertTriangle size={15} /> },
];

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function SettingsPanel() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const clearSettings = useClearSettings();
  const teamMembers = useTeamMembers();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [tab, setTab] = useState<Tab | "about">("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [drawerMember, setDrawerMember] = useState<TeamMember | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const aboutImageRef = useRef<HTMLInputElement>(null);

  const [general, setGeneral] = useState({
    siteName: "", tagline: "", email: "", whatsapp: "",
    instagram: "", facebook: "", youtube: "",
  });
  const [home, setHome] = useState({ h1: "", h2: "", cta1: "", cta2: "" });
  const [about, setAbout] = useState({
    founderName: "", founderRole: "", founderBio: "", founderImage: ""
  });

  useEffect(() => {
    if (!settings) return;
    setGeneral({
      siteName: settings.general?.siteName || "",
      tagline: settings.general?.tagline || "",
      email: settings.general?.email || "",
      whatsapp: settings.general?.whatsapp || "",
      instagram: settings.general?.instagram || "",
      facebook: settings.general?.facebook || "",
      youtube: settings.general?.youtube || "",
    });
    setHome({
      h1: settings.home?.h1 || "",
      h2: settings.home?.h2 || "",
      cta1: settings.home?.cta1 || "",
      cta2: settings.home?.cta2 || "",
    });
    setAbout({
      founderName: settings.aboutPage?.founderName || "",
      founderRole: settings.aboutPage?.founderRole || "",
      founderBio: settings.aboutPage?.founderBio || "",
      founderImage: settings.aboutPage?.founderImage || "",
    });
  }, [settings]);

  const handleSave = async () => {
    await withErrorHandler(async () => {
      await updateSettings({ general, home, aboutPage: about });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, setSaving, { showSuccessToast: true, successMessage: "Settings saved" });
  };

  const handleSaveMember = async (m: TeamMember) => {
    await withErrorHandler(async () => {
      if (m._id) {
        await updateMember({ id: m._id as Id<"teamMembers">, name: m.name, role: m.role, tag: m.tag, bio: m.bio, image: m.image });
      } else {
        await createMember({ name: m.name, role: m.role, tag: m.tag, bio: m.bio, image: m.image, order: teamMembers.length });
      }
      setDrawerMember(null);
    }, undefined, { showSuccessToast: true, successMessage: m._id ? "Team member updated" : "Team member added" });
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    await withErrorHandler(async () => {
      await deleteMember({ id: id as Id<"teamMembers"> });
    }, undefined, { showSuccessToast: true, successMessage: "Team member removed" });
  };

  const handleClearSettings = async () => {
    await withErrorHandler(async () => {
      await clearSettings({ confirmationToken: "CLEAR" });
      setConfirmClearOpen(false);
    }, setClearing, { showSuccessToast: true, successMessage: "All settings cleared and reset" });
  };

  const g = (k: keyof typeof general) => (v: string) => setGeneral(p => ({ ...p, [k]: v }));
  const h = (k: keyof typeof home) => (v: string) => setHome(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-[#111]">
        <div className="flex items-center gap-2 text-[#333] text-xs mb-4">
          <Settings size={13} />
          <ChevronRight size={11} />
          <span className="text-[#555]">Settings</span>
        </div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-[#444]">Manage site configuration, content, and team profiles.</p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-52 flex-shrink-0 p-4 border-r border-[#111] min-h-[calc(100vh-130px)]">
          <div className="space-y-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                  tab === t.id
                    ? "bg-white/[0.07] text-white"
                    : "text-[#444] hover:text-[#888] hover:bg-white/[0.03]"
                } ${t.id === "danger" ? (tab === "danger" ? "text-red-400" : "hover:text-red-400") : ""}`}
              >
                <span className={tab === t.id && t.id !== "danger" ? "text-white" : ""}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 px-8 py-6 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ── GENERAL TAB ─────────────────────────────────────────── */}
              {tab === "general" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-white">General</h2>
                    <p className="text-xs text-[#444] mt-0.5">Core site identity and contact info.</p>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl px-6 divide-y divide-[#111]">
                    <FieldGroup label="Site name" hint="Displayed in the browser tab and SEO.">
                      <AdminInput value={general.siteName} onChange={g("siteName")} placeholder="Carrow" />
                    </FieldGroup>

                    <FieldGroup label="Tagline" hint="Short brand descriptor, shown in the footer.">
                      <AdminInput value={general.tagline} onChange={g("tagline")} placeholder="We build brands that stand out." />
                    </FieldGroup>

                    <FieldGroup label="Contact email" hint="Used in inquiry forms and the Connect section.">
                      <AdminInput value={general.email} onChange={g("email")} type="email" placeholder="hello@carrow.agency" icon={<Mail size={14} />} />
                    </FieldGroup>

                    <FieldGroup label="WhatsApp" hint="Number for direct client contact.">
                      <AdminInput value={general.whatsapp} onChange={g("whatsapp")} placeholder="+1 234 567 8900" icon={<MessageCircle size={14} />} />
                    </FieldGroup>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6 mb-2">
                    <h3 className="text-sm font-medium text-white">Social links</h3>
                    <p className="text-xs text-[#444] mt-0.5">Shown as icon buttons in the footer.</p>
                  </div>
                  <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl px-6 divide-y divide-[#111]">
                    <FieldGroup label="Instagram" hint="Full profile URL.">
                      <AdminInput value={general.instagram} onChange={g("instagram")} placeholder="https://instagram.com/carrow" icon={<Instagram size={14} />} />
                    </FieldGroup>
                    <FieldGroup label="Facebook" hint="Full page URL.">
                      <AdminInput value={general.facebook} onChange={g("facebook")} placeholder="https://facebook.com/carrow" icon={<Facebook size={14} />} />
                    </FieldGroup>
                    <FieldGroup label="YouTube" hint="Full channel URL.">
                      <AdminInput value={general.youtube} onChange={g("youtube")} placeholder="https://youtube.com/@carrow" icon={<Youtube size={14} />} />
                    </FieldGroup>
                  </div>

                  <SaveBar saving={saving} saved={saved} onSave={handleSave} />
                </div>
              )}

              {/* ── CONTENT TAB ─────────────────────────────────────────── */}
              {tab === "content" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-white">Site Content</h2>
                    <p className="text-xs text-[#444] mt-0.5">Editable copy shown across the homepage.</p>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl px-6 divide-y divide-[#111]">
                    <FieldGroup label="Hero headline" hint="Large H1 on the homepage hero.">
                      <AdminInput value={home.h1} onChange={h("h1")} placeholder="We Build Brands That Stand Out." />
                    </FieldGroup>
                    <FieldGroup label="Hero subtitle" hint="Secondary line below the headline.">
                      <AdminInput value={home.h2} onChange={h("h2")} placeholder="Bold, strategic, and built to last." />
                    </FieldGroup>
                    <FieldGroup label="Primary CTA" hint="Text for the main call-to-action button.">
                      <AdminInput value={home.cta1} onChange={h("cta1")} placeholder="Get Started" />
                    </FieldGroup>
                    <FieldGroup label="Secondary CTA" hint="Text for the secondary button.">
                      <AdminInput value={home.cta2} onChange={h("cta2")} placeholder="See Our Work" />
                    </FieldGroup>
                  </div>

                  {/* Live preview */}
                  <div className="mt-6 bg-[#0c0c0c] border border-[#161616] rounded-2xl p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#333] mb-5">Live preview</p>
                    <div className="text-center py-4">
                      <h2 className="font-serif text-3xl font-bold text-white tracking-tight leading-tight">
                        {home.h1 || "Your Headline"}
                      </h2>
                      <p className="mt-3 text-sm text-[#444] max-w-xs mx-auto">{home.h2 || "Your subtitle"}</p>
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <span className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold">
                          {home.cta1 || "CTA 1"}
                        </span>
                        <span className="px-5 py-2 rounded-full border border-[#222] text-white text-sm font-medium">
                          {home.cta2 || "CTA 2"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <SaveBar saving={saving} saved={saved} onSave={handleSave} />
                </div>
              )}

              {/* ── ABOUT TAB ─────────────────────────────────────────── */}
              {tab === "about" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-white">About Page</h2>
                    <p className="text-xs text-[#444] mt-0.5">Manage the storytelling and founder profile.</p>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl px-6 divide-y divide-[#111]">
                    <FieldGroup label="Founder Profile" hint="Core leadership info shown at the bottom.">
                      <div className="flex items-center gap-6 mb-6">
                        <button
                          type="button"
                          onClick={() => aboutImageRef.current?.click()}
                          className="relative w-20 h-20 rounded-full bg-[#111] border border-[#222] overflow-hidden group hover:border-[#333] transition-colors"
                        >
                          {about.founderImage ? (
                            <img src={about.founderImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#333] group-hover:text-[#555]">
                              <Camera size={20} />
                            </div>
                          )}
                          {uploadingAboutImage && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 size={16} className="text-white animate-spin" />
                            </div>
                          )}
                        </button>
                        <input ref={aboutImageRef} type="file" accept="image/*" className="hidden" onChange={handleAboutImageUpload} />
                        <div>
                          <p className="text-sm font-medium text-white">Profile Photo</p>
                          <p className="text-xs text-[#444] mt-0.5">Recommended: 400x400px</p>
                        </div>
                      </div>

                      <AdminInput value={about.founderName} onChange={a("founderName")} placeholder="Founder Name" label="Name" />
                      <AdminInput value={about.founderRole} onChange={a("founderRole")} placeholder="e.g. Founder & Creative Director" label="Role" />
                    </FieldGroup>

                    <FieldGroup label="Founder Bio" hint="The personal story or vision statement.">
                      <AdminTextarea value={about.founderBio} onChange={a("founderBio")} placeholder="Tell your story..." />
                    </FieldGroup>
                  </div>

                  <SaveBar saving={saving} saved={saved} onSave={handleSave} />
                </div>
              )}

              {/* ── TEAM TAB ─────────────────────────────────────────────── */}
              {tab === "team" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-base font-semibold text-white">Team</h2>
                      <p className="text-xs text-[#444] mt-0.5">Profiles shown on the About page.</p>
                    </div>
                    <button
                      onClick={() => setDrawerMember(EMPTY_MEMBER)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold transition-all active:scale-[0.97]"
                    >
                      <Plus size={15} />
                      Add member
                    </button>
                  </div>

                  {teamMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#0c0c0c] border border-[#161616] rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center mb-4">
                        <Users size={20} className="text-[#333]" />
                      </div>
                      <p className="text-sm font-medium text-[#444]">No team members yet</p>
                      <p className="text-xs text-[#333] mt-1">Click "Add member" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {(teamMembers as (TeamMember & { _id: string })[]).map(m => (
                          <MemberCard
                            key={m._id}
                            member={m}
                            onEdit={() => setDrawerMember({ ...m, tag: m.tag || "team", bio: m.bio || "", image: m.image || "" })}
                            onDelete={() => handleDeleteMember(m._id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* ── DANGER TAB ───────────────────────────────────────────── */}
              {tab === "danger" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
                    <p className="text-xs text-[#444] mt-0.5">Irreversible actions. Proceed with care.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        title: "Clear all settings",
                        desc: "Resets site name, social links, and homepage copy to defaults. Client data is unaffected.",
                        label: "Clear settings",
                        onClick: () => setConfirmClearOpen(true)
                      }
                    ].map(action => (
                      <div key={action.title} className="flex items-center justify-between p-5 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">{action.title}</p>
                          <p className="text-xs text-[#444] mt-0.5 max-w-xs">{action.desc}</p>
                        </div>
                        <button 
                          onClick={action.onClick}
                          className="flex-shrink-0 ml-6 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                        >
                          {action.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Member Drawer */}
      <AnimatePresence>
        {drawerMember !== null && (
          <MemberDrawer
            member={drawerMember}
            onSave={handleSaveMember}
            onClose={() => setDrawerMember(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleClearSettings}
        loading={clearing}
        title="Clear All Settings?"
        description="This will reset your site name, tagline, email, social links, and homepage configuration to default values. Your database, plans, users, and portfolio works will not be affected."
        confirmLabel="Clear Settings"
        requireTypedConfirmation="CLEAR"
      />
    </div>
  );
}
