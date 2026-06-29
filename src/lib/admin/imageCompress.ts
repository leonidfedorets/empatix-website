// Client-side image compression / validation utilities for admin uploads.

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB hard limit before compression
export const IMAGE_MAX_DIMENSION = 1920; // longest side after resize
export const IMAGE_COMPRESS_QUALITY = 0.82;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export type ImageValidationError = {
  code: "too_large" | "bad_type";
  message: string;
};

export function validateImageFile(file: File): ImageValidationError | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      code: "bad_type",
      message: `Unsupported format "${file.type || "unknown"}". Use JPG, PNG, WebP, GIF or SVG.`,
    };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return {
      code: "too_large",
      message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max allowed is ${IMAGE_MAX_BYTES / 1024 / 1024} MB.`,
    };
  }
  return null;
}

/**
 * Compresses an image File client-side: scales the longest side down to
 * IMAGE_MAX_DIMENSION and re-encodes as WebP (or JPEG fallback). Skips
 * SVG/GIF (vector / animated) and tiny files that won't benefit.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  if (file.size < 100 * 1024) return file; // <100 KB → not worth re-encoding

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Could not decode image"));
    i.src = dataUrl;
  });

  const longest = Math.max(img.width, img.height);
  const scale = longest > IMAGE_MAX_DIMENSION ? IMAGE_MAX_DIMENSION / longest : 1;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  // Prefer WebP; fall back to original type if WebP not supported.
  const outType = "image/webp";
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, outType, IMAGE_COMPRESS_QUALITY),
  );
  if (!blob || blob.size >= file.size) return file; // no win → keep original

  const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], newName, { type: outType, lastModified: Date.now() });
}
