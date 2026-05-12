import { useState, useRef, useCallback } from "react";
import { X, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { useGenerateUploadUrl, useWorkMediaByWork, useAddWorkMedia, useRemoveWorkMedia } from "../../../lib/useConvex";
import { toWebP } from "../../../lib/toWebP";
import { Id } from "../../../../convex/_generated/dataModel";

export function MediaUploadCell({
  onAdd,
}: {
  onAdd: (storageId: string, type: string) => Promise<void>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const generateUrl = useGenerateUploadUrl();
  const [uploading, setUploading] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { blob, isConverted } = await toWebP(file);
      const finalFile = isConverted ? new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }) : file;
      const url = await generateUrl();
      const res = await fetch(url, { method: "POST", body: finalFile, headers: { "Content-Type": finalFile.type } });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      await onAdd(storageId, finalFile.type);
    } catch (err) { console.error(err); }
    setUploading(false);
    if (ref.current) ref.current.value = "";
  };

  return (
    <>
      <input ref={ref} type="file" accept="image/*,video/*" className="hidden" onChange={handle} />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors disabled:opacity-40"
      >
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        {uploading ? "Uploading…" : "Add media"}
      </button>
    </>
  );
}

export function WorkMediaStrip({ workId }: { workId: string }) {
  const media = useWorkMediaByWork(workId);
  const removeMedia = useRemoveWorkMedia();
  const addMedia = useAddWorkMedia();

  const handleAdd = useCallback(
    async (storageId: string, type: string) => {
      await addMedia({ workId: workId as Id<"works">, storageId: storageId as Id<"_storage">, type, order: media.length });
    },
    [workId, addMedia, media.length]
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {media.map((m) => (
        <div key={m._id} className="group relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]">
          {m.url && m.type?.startsWith("image") ? (
            <img src={m.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#444]">
              <ImageIcon size={14} />
            </div>
          )}
          <button
            onClick={() => removeMedia({ id: m._id })}
            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          >
            <X size={12} className="text-red-400" />
          </button>
        </div>
      ))}
      <MediaUploadCell onAdd={handleAdd} />
    </div>
  );
}
