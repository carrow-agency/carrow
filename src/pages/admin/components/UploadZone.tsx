import { useRef, useState, DragEvent } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { useGenerateUploadUrl, useSaveClientFile } from "../../../lib/useConvex";
import { toWebP } from "../../../lib/toWebP";

const FILE_LABELS = ["Contract", "Report", "Media"] as const;
type FileLabel = (typeof FILE_LABELS)[number];

interface Props {
  targetUserId: string;
  onSuccess?: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadZone({ targetUserId, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileLabel, setFileLabel] = useState<FileLabel>("Media");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const generateUploadUrl = useGenerateUploadUrl();
  const saveClientFile = useSaveClientFile();

  const uploadFile = async (rawFile: File) => {
    setUploadState("uploading");
    setProgress(5);
    setErrorMessage("");

    try {
      // Convert images to WebP (except GIFs and videos)
      const { blob, name, isConverted } = await toWebP(rawFile, 0.85);
      const finalMime = isConverted ? "image/webp" : rawFile.type;
      setProgress(15);

      const uploadUrl = await generateUploadUrl();
      setProgress(25);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Content-Type", finalMime);

      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(25 + Math.round((e.loaded / e.total) * 65));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(blob);
      });

      setProgress(94);
      const { storageId } = JSON.parse(xhr.responseText);

      await saveClientFile({
        storageId,
        userId: targetUserId as any,
        fileLabel,
        mimeType: finalMime,
        name,
        size: blob.size,
      });

      setProgress(100);
      setUploadState("success");
      onSuccess?.();

      setTimeout(() => {
        setUploadState("idle");
        setProgress(0);
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMessage(msg);
      setUploadState("error");
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  return (
    <div className="space-y-3">
      {/* Type Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-admin-muted uppercase tracking-wider">Upload as</span>
        <div className="flex gap-1">
          {FILE_LABELS.map((label) => (
            <button
              key={label}
              onClick={() => setFileLabel(label)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                fileLabel === label
                  ? "bg-white text-admin-bg"
                  : "bg-admin-surface2 text-admin-muted border border-admin-border hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => uploadState === "idle" && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer select-none ${
          isDragOver
            ? "border-white/50 bg-white/5"
            : uploadState === "success"
            ? "border-emerald-500/50 bg-emerald-500/5"
            : uploadState === "error"
            ? "border-red-500/50 bg-red-500/5"
            : "border-admin-border bg-admin-surface hover:border-white/30 hover:bg-white/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.mp4,.mov"
          onChange={handleFileChange}
        />

        {uploadState === "idle" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-surface2 border border-admin-border text-admin-muted">
              <Upload size={20} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Drop a file here or <span className="text-white underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-admin-muted mt-1">
                Images auto-convert to WebP · PDF, video, docs up to 20 MB
              </p>
            </div>
          </>
        )}

        {uploadState === "uploading" && (
          <div className="w-full flex flex-col items-center gap-3">
            <Loader2 size={24} className="text-white animate-spin" />
            <div className="w-full max-w-xs space-y-1">
              <div className="h-1.5 w-full rounded-full bg-admin-surface2">
                <div
                  className="h-1.5 rounded-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-admin-muted text-center">{progress}%</p>
            </div>
          </div>
        )}

        {uploadState === "success" && (
          <>
            <CheckCircle size={28} className="text-emerald-400" />
            <p className="text-sm font-medium text-emerald-400">File uploaded successfully</p>
          </>
        )}

        {uploadState === "error" && (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm font-medium text-red-400">Upload failed</p>
            <p className="text-xs text-red-400/70 text-center max-w-[280px]">{errorMessage}</p>
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setUploadState("idle"); setErrorMessage(""); }}
            >
              <X size={13} /> Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
