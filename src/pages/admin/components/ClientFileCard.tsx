import { useState } from "react";
import { Download, Trash2, FileText, BarChart2, Image as ImageIcon, File } from "lucide-react";
import { useDeleteClientFile } from "../../../lib/useConvex";

interface FileRecord {
  _id: string;
  name: string;
  type: string;          // MIME type
  fileLabel?: string;    // "Contract" | "Report" | "Media"
  size?: number;
  url?: string | null;
  _creationTime: number;
}

interface Props {
  file: FileRecord;
  onDeleted?: () => void;
}

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const LABEL_STYLES: Record<string, string> = {
  Contract: "text-blue-400 bg-blue-400/10",
  Report:   "text-green-400 bg-green-400/10",
  Media:    "text-purple-400 bg-purple-400/10",
};

const LabelIcon = ({ fileLabel, mimeType }: { fileLabel?: string; mimeType: string }) => {
  if (fileLabel === "Contract") return <FileText size={16} className="text-blue-400" />;
  if (fileLabel === "Report")   return <BarChart2 size={16} className="text-green-400" />;
  if (mimeType.startsWith("image/")) return <ImageIcon size={16} className="text-purple-400" />;
  return <File size={16} className="text-admin-muted" />;
};

export function ClientFileCard({ file, onDeleted }: Props) {
  const deleteClientFile = useDeleteClientFile();
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isImage = file.type.startsWith("image/");
  const label = file.fileLabel ?? (isImage ? "Media" : "Report");
  const labelStyle = LABEL_STYLES[label] ?? "text-admin-muted bg-admin-surface2";

  const handleDelete = async () => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteClientFile({ id: file._id as any });
      onDeleted?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <article className="group flex items-center gap-4 rounded-xl border border-admin-border bg-admin-surface px-4 py-3 hover:border-white/20 transition-all">
        {/* Thumbnail / Icon */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-surface2 overflow-hidden cursor-pointer"
          onClick={() => isImage && file.url && setShowPreview(true)}
        >
          {isImage && file.url ? (
            <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
          ) : (
            <LabelIcon fileLabel={label} mimeType={file.type} />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white leading-tight" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${labelStyle}`}>
              {label}
            </span>
            <span className="text-[11px] text-admin-muted">{formatSize(file.size)}</span>
            <span className="text-[11px] text-admin-muted">·</span>
            <span className="text-[11px] text-admin-muted">{formatDate(file._creationTime)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {file.url && (
            <a
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-admin-muted hover:bg-white/5 hover:text-white transition-colors"
              title="Download"
            >
              <Download size={14} />
            </a>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-admin-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </article>

      {/* Image Preview Modal */}
      {showPreview && file.url && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
