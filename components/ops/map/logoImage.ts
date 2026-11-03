import { LOGO_MAX_CHARS, LOGO_MAX_PX } from "@/lib/points/limits";

/** Client-side logo preparation: fit into 256 px, encode as a small data URL the API accepts */

const SOURCE_MAX_BYTES = 15 * 1024 * 1024;

/** code → points dictionary logo.errors.<code> */
export type LogoErrorCode = "unreadable" | "notImage" | "tooBig" | "noCanvas" | "tooDetailed";

export class LogoError extends Error {
  constructor(readonly code: LogoErrorCode) {
    super(code);
  }
}

function decode(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new LogoError("unreadable"));
    };
    img.src = url;
  });
}

/** webp first; browsers without a webp encoder return png, then jpeg on white is the last resort */
function encode(canvas: HTMLCanvasElement): string | null {
  for (const q of [0.9, 0.8, 0.65, 0.5]) {
    const webp = canvas.toDataURL("image/webp", q);
    if (!webp.startsWith("data:image/webp")) break;
    if (webp.length <= LOGO_MAX_CHARS) return webp;
  }
  const png = canvas.toDataURL("image/png");
  if (png.length <= LOGO_MAX_CHARS) return png;
  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const ctx = flat.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, flat.width, flat.height);
  ctx.drawImage(canvas, 0, 0);
  for (const q of [0.85, 0.7, 0.55]) {
    const jpeg = flat.toDataURL("image/jpeg", q);
    if (jpeg.length <= LOGO_MAX_CHARS) return jpeg;
  }
  return null;
}

/** Keeps the whole logo (no crop): the longest side becomes at most 256 px */
export async function prepareLogo(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new LogoError("notImage");
  if (file.size > SOURCE_MAX_BYTES) throw new LogoError("tooBig");
  const img = await decode(file);
  const w = img.naturalWidth || LOGO_MAX_PX;
  const h = img.naturalHeight || LOGO_MAX_PX;
  // vector logos scale up crisply; bitmaps are only scaled down
  const fit = LOGO_MAX_PX / Math.max(w, h);
  const k = file.type === "image/svg+xml" ? fit : Math.min(1, fit);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * k));
  canvas.height = Math.max(1, Math.round(h * k));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new LogoError("noCanvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const url = encode(canvas);
  if (!url) throw new LogoError("tooDetailed");
  return url;
}
