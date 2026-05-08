import { Upload } from "lucide-react";
import { useState } from "react";

export function FileUpload({ onFile }: { onFile?: (file: File) => void }) {
  const [hover, setHover] = useState(false);
  const [name, setName] = useState<string | null>(null);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const f = e.dataTransfer.files?.[0];
        if (f) { setName(f.name); onFile?.(f); }
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center transition-colors ${
        hover ? "border-white/40 bg-white/[0.03]" : "border-admin-border bg-admin-surface2"
      }`}
    >
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setName(f.name); onFile?.(f); }
        }}
      />
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-admin-border bg-admin-surface">
        <Upload size={18} className="text-admin-muted" />
      </div>
      <p className="text-sm text-white">{name ?? "Drop file here, or click to browse"}</p>
      <p className="mt-1 text-xs text-admin-muted">PNG, JPG, PDF up to 50MB</p>
    </label>
  );
}
