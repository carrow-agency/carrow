import { useMemo, useState, useRef } from "react";
import { PageHeader } from "./components/PageHeader";
import { Button } from "./components/Button";
import { StatsCard } from "./components/StatsCard";
import { useClientFiles, useAllFiles, useGenerateUploadUrl, useSaveClientFile, useDeleteClientFile, useUsers } from "../../lib/useConvex";
import { FileText, Image as ImageIcon, FileBarChart, Download, Trash2, Upload, X } from "lucide-react";

const tabs = ["All", "Contract", "Report", "Media"] as const;

const iconFor = (t: string) =>
  t === "Contract" ? FileText : t === "Report" ? FileBarChart : ImageIcon;

interface FileData {
  _id: string;
  storageId: string;
  name: string;
  type: string;
  size?: number;
  url?: string;
  createdAt?: string;
}

export default function FilesPanel() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const files = useAllFiles();
  const users = useUsers();
  const generateUploadUrl = useGenerateUploadUrl();
  const saveClientFile = useSaveClientFile();
  const deleteClientFile = useDeleteClientFile();

  const allFiles: FileData[] = useMemo(() => files || [], [files]);
  
  const filteredFiles = useMemo(() => {
    if (tab === "All") return allFiles;
    return allFiles.filter(f => f.type === tab);
  }, [allFiles, tab]);

  const stats = useMemo(() => ({
    total: allFiles.length,
    contracts: allFiles.filter(f => f.type === "Contract").length,
    reports: allFiles.filter(f => f.type === "Report").length,
    media: allFiles.filter(f => f.type?.startsWith("image/")).length,
  }), [allFiles]);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      if (!response.ok) throw new Error("Upload failed");
      
      const { storageId } = await response.json();
      
      const fileType = file.type.startsWith("image/") ? "Media" 
        : file.type === "application/pdf" ? "Contract" 
        : "Report";
      
      await saveClientFile({
        storageId,
        userId: users?.[0]?._id as any,
        type: fileType,
        name: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error("Failed to upload:", error);
      alert("Failed to upload file. Please try again.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (fileId: string, storageId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    setDeleting(fileId);
    try {
      await deleteClientFile({ id: fileId as any, storageId: storageId as any });
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete file. Please try again.");
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Storage"
        title="Files"
        description="Documents, contracts and media shared across client engagements."
        actions={<>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Upload size={14} className="animate-pulse" /> : <Upload size={14} />}
            {uploading ? "Uploading..." : "Upload file"}
          </Button>
        </>}
      />

      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatsCard label="Total files" value={String(stats.total)} />
        <StatsCard label="Contracts" value={String(stats.contracts)} />
        <StatsCard label="Reports" value={String(stats.reports)} />
        <StatsCard label="Media" value={String(stats.media)} />
      </section>

      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors ${
              tab === t
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >{t === "All" ? "All files" : t + "s"}</button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <FileText size={32} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">No files yet</p>
          <p className="mt-1 text-sm text-gray-400">Upload your first file to get started</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredFiles.map((f) => {
            const Icon = iconFor(f.type);
            return (
              <article 
                key={f._id} 
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {f.type} · {formatSize(f.size)} · {formatDate(f.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button size="sm" variant="ghost" as="a" href={f.url} download={f.name} target="_blank">
                    <Download size={13} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDelete(f._id, f.storageId)}
                    disabled={deleting === f._id}
                  >
                    {deleting === f._id ? <X size={13} className="animate-pulse" /> : <Trash2 size={13} />}
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}