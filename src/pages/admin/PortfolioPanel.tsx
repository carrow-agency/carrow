import { useState, useEffect, useMemo, useRef } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { Modal } from "./components/Modal";
import { Input, Select } from "./components/Input";
import { Toggle } from "./components/Toggle";
import { FileUpload } from "./components/FileUpload";
import { useWorksAll, useCreateWork, useUpdateWork, useDeleteWork, useGenerateUploadUrl } from "../../lib/useConvex";
import { Plus, Pencil, Trash2, X, ExternalLink, Image } from "lucide-react";

interface WorkData {
  id: string;
  url: string;
  title: string;
  category: string;
  client?: string;
  published?: boolean;
}

const categories = ["Brand Identity", "Web Design", "Social Media", "Print", "Motion"];

export default function PortfolioPanel() {
  const works = useWorksAll();
  const createWork = useCreateWork();
  const updateWork = useUpdateWork();
  const deleteWork = useDeleteWork();
  const generateUploadUrl = useGenerateUploadUrl();
  
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    category: "Brand Identity",
    published: true,
  });

  const items: WorkData[] = useMemo(() => works || [], [works]);

  const handleOpenNew = () => {
    setFormData({ title: "", client: "", category: "Brand Identity", published: true });
    setUploadedImage(null);
    setEditingId(null);
    setOpen(true);
  };

  const handleOpenEdit = (work: WorkData) => {
    setFormData({
      title: work.title,
      client: work.client || "",
      category: work.category,
      published: work.published ?? false,
    });
    setUploadedImage(work.url);
    setEditingId(work.id);
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      if (!response.ok) throw new Error("Upload failed");
      const { storageId } = await response.json();
      setUploadedImage(storageId);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    }
    setUploadingImage(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    
    setSaving(true);
    try {
      if (editingId) {
        await updateWork({
          id: editingId as any,
          title: formData.title,
          client: formData.client,
          category: formData.category,
          url: uploadedImage || undefined,
          published: formData.published,
        });
      } else {
        if (!uploadedImage) {
          alert("Please upload an image");
          setSaving(false);
          return;
        }
        await createWork({
          title: formData.title,
          client: formData.client,
          category: formData.category,
          url: uploadedImage,
          published: formData.published,
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to save work:", error);
      alert("Failed to save work. Please try again.");
    }
    setSaving(false);
  };

  const handleTogglePublish = async (work: WorkData, published: boolean) => {
    try {
      await updateWork({
        id: work.id as any,
        published,
      });
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  const handleDelete = async (workId: string) => {
    if (!confirm("Are you sure you want to delete this work?")) return;
    
    setDeleting(workId);
    try {
      await deleteWork({ id: workId as any });
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete work. Please try again.");
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Showcase"
        title="Portfolio"
        description="The body of work presented on Carrow's public-facing site. Curate carefully."
        actions={<Button onClick={handleOpenNew}><Plus size={14} /> New work</Button>}
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Image size={32} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">No portfolio items yet</p>
          <p className="mt-1 text-sm text-gray-400">Add your first project to showcase your work</p>
          <Button onClick={handleOpenNew} className="mt-6">
            <Plus size={14} /> Add first work
          </Button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((w) => (
            <article 
              key={w.id} 
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300 hover:shadow-sm"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                {w.url ? (
                  <img
                    src={w.url}
                    alt={w.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <Image size={24} className="text-gray-300" />
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-600 backdrop-blur">
                  {w.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <h3 className="font-display text-base font-semibold tracking-tight text-gray-900">{w.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{w.client}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                  <Toggle
                    checked={w.published ?? false}
                    onChange={(v) => handleTogglePublish(w, v)}
                    label={w.published ? "Published" : "Draft"}
                  />
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(w)}>
                      <Pencil size={13} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDelete(w.id)}
                      disabled={deleting === w.id}
                    >
                      {deleting === w.id ? (
                        <X size={13} className="animate-pulse" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit work" : "Add new work"}
        subtitle="Publish a project to your public portfolio."
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save work"}
          </Button>
        </>}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Image</label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {uploadedImage ? (
              <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex h-40 w-full max-w-xs flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400"
              >
                {uploadingImage ? (
                  <>
                    <Image size={24} className="animate-pulse text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus size={24} className="text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Click to upload image</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Title" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Project title" 
            />
            <Input 
              label="Client" 
              value={formData.client} 
              onChange={(e) => setFormData({...formData, client: e.target.value})}
              placeholder="Client name" 
            />
            <Select 
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            <div className="flex items-end">
              <Toggle 
                checked={formData.published} 
                onChange={(v) => setFormData({...formData, published: v})} 
                label="Publish immediately" 
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}