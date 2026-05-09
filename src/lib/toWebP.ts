/**
 * Converts any browser-readable image file to a WebP blob using the Canvas API.
 * Non-image files are returned as-is.
 * @param file     Original file from input/drag-drop
 * @param quality  WebP quality 0–1 (default 0.85)
 */
export async function toWebP(
  file: File,
  quality = 0.85
): Promise<{ blob: Blob; name: string; isConverted: boolean }> {
  const isImage = file.type.startsWith("image/") && file.type !== "image/gif";
  // Don't touch videos, PDFs, docs, or animated GIFs
  if (!isImage) {
    return { blob: file, name: file.name, isConverted: false };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Canvas not available — fall back to original
        resolve({ blob: file, name: file.name, isConverted: false });
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Conversion failed — fall back to original
            resolve({ blob: file, name: file.name, isConverted: false });
            return;
          }
          // Replace extension with .webp
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve({ blob, name: `${baseName}.webp`, isConverted: true });
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Can't decode — fall back to original
      resolve({ blob: file, name: file.name, isConverted: false });
    };

    img.src = objectUrl;
  });
}
