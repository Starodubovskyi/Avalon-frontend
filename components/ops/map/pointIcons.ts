import type mapboxgl from "mapbox-gl";
import { POINT_KINDS, POINT_KIND_COLORS, type PointKind } from "@/lib/points/team-points";
import { hexToRgba } from "@/lib/points/kind-colors";

/**
 * Map markers drawn on canvas, "buildings" of a strategy game: a rounded block with the kind's gradient,
 * a darker plinth under it, a soft coloured glow and a ground shadow. Drawn at 2× for crisp edges.
 */

const RATIO = 2;
const W = 104;
const H = 108;
const TILE = { x: 20, y: 12, size: 64, radius: 17, depth: 8 };
const GROUND = { x: W / 2, y: H - 9, rx: 26, ry: 7 };

/** Lucide glyphs (24×24, stroke 2) as SVG path data; rect/circle converted to paths */
const GLYPHS: Record<PointKind, { stroke: string[]; dots?: [number, number][] }> = {
  head_office: {
    stroke: [
      "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
      "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
      "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
      "M10 6h4",
      "M10 10h4",
      "M10 14h4",
      "M10 18h4",
    ],
  },
  branch: {
    stroke: [
      "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z",
      "M9 22v-4h6v4",
      "M8 6h.01",
      "M12 6h.01",
      "M16 6h.01",
      "M8 10h.01",
      "M12 10h.01",
      "M16 10h.01",
      "M8 14h.01",
      "M12 14h.01",
      "M16 14h.01",
    ],
  },
  self_employed: {
    stroke: [
      "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
      "M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
    ],
  },
  for_sale: {
    stroke: [
      "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
    ],
    dots: [[7.5, 7.5]],
  },
  authority: {
    stroke: [
      "M10 18v-7",
      "M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",
      "M14 18v-7",
      "M18 18v-7",
      "M3 22h18",
      "M6 18v-7",
    ],
  },
  private_person: {
    stroke: ["M17 8a5 5 0 1 1-10 0a5 5 0 1 1 10 0z", "M20 21a8 8 0 0 0-16 0"],
  },
};

export function pointIconId(kind: PointKind): string {
  return `av-pt2-${kind}`;
}

/** Image id of a point's logo marker: changes with the logo version and with the kind (rim colour) */
export function logoIconId(pointId: string, logoVersion: string, kind: PointKind): string {
  return `av-logo-${pointId}-${logoVersion}-${kind}`;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function canvas2d(): CanvasRenderingContext2D | null {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  return canvas.getContext("2d");
}

/** Ground shadow, glow, outline and plinth shared by both marker styles */
function drawBody(ctx: CanvasRenderingContext2D, kind: PointKind, outline: string) {
  const c = POINT_KIND_COLORS[kind];
  const { x, y, size, radius, depth } = TILE;

  ctx.save();
  ctx.translate(GROUND.x, GROUND.y);
  ctx.scale(1, GROUND.ry / GROUND.rx);
  const ground = ctx.createRadialGradient(0, 0, 0, 0, 0, GROUND.rx);
  ground.addColorStop(0, "rgba(2,6,23,0.42)");
  ground.addColorStop(1, "rgba(2,6,23,0)");
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.arc(0, 0, GROUND.rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = hexToRgba(c.base, 0.7);
  ctx.shadowBlur = 20;
  roundedRect(ctx, x, y, size, size + depth, radius);
  ctx.fillStyle = c.base;
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 6;
  ctx.strokeStyle = outline;
  roundedRect(ctx, x, y, size, size + depth, radius);
  ctx.stroke();

  roundedRect(ctx, x, y + depth, size, size, radius);
  ctx.fillStyle = c.dark;
  ctx.fill();
}

function drawGloss(ctx: CanvasRenderingContext2D) {
  const { x, y, size, radius } = TILE;
  ctx.save();
  roundedRect(ctx, x, y, size, size, radius);
  ctx.clip();
  const gloss = ctx.createLinearGradient(0, y, 0, y + size * 0.6);
  gloss.addColorStop(0, "rgba(255,255,255,0.38)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.fillRect(x, y, size, size * 0.6);
  ctx.restore();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  roundedRect(ctx, x + 1.5, y + 1.5, size - 3, size - 3, TILE.radius - 1.5);
  ctx.stroke();
}

function drawGlyph(ctx: CanvasRenderingContext2D, kind: PointKind) {
  const scale = 36 / 24;
  const cx = TILE.x + TILE.size / 2;
  const cy = TILE.y + TILE.size / 2;
  const glyph = GLYPHS[kind];
  ctx.save();
  ctx.translate(cx - 12 * scale, cy - 12 * scale);
  ctx.scale(scale, scale);
  ctx.shadowColor = "rgba(2,6,23,0.35)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 0.6;
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 2.3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of glyph.stroke) ctx.stroke(new Path2D(d));
  for (const [dx, dy] of glyph.dots ?? []) {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawKindMarker(kind: PointKind, outline: string): ImageData | null {
  const ctx = canvas2d();
  if (!ctx) return null;
  const c = POINT_KIND_COLORS[kind];
  drawBody(ctx, kind, outline);
  const { x, y, size, radius } = TILE;
  const face = ctx.createLinearGradient(x, y, x + size, y + size);
  face.addColorStop(0, c.light);
  face.addColorStop(1, c.base);
  roundedRect(ctx, x, y, size, size, radius);
  ctx.fillStyle = face;
  ctx.fill();
  drawGloss(ctx);
  drawGlyph(ctx, kind);
  return ctx.getImageData(0, 0, W, H);
}

export function installPointIcons(map: mapboxgl.Map, dark: boolean): void {
  const outline = dark ? "rgba(2,6,23,0.92)" : "rgba(255,255,255,0.98)";
  for (const kind of POINT_KINDS) {
    const id = pointIconId(kind);
    const img = drawKindMarker(kind, outline);
    if (!img) continue;
    // theme switch: same size, so the image is swapped in place
    if (map.hasImage(id)) map.updateImage(id, img);
    else map.addImage(id, img, { pixelRatio: RATIO });
  }
}

export type LogoSource = ImageBitmap | HTMLImageElement;

function imageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("logo failed to decode"));
    };
    img.src = url;
  });
}

/** Bitmaps decode off the main thread; SVG (demo logos) and older browsers fall back to an <img> */
export async function decodeLogo(blob: Blob): Promise<LogoSource> {
  if (blob.type !== "image/svg+xml" && typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob);
    } catch {
      /* fall through to <img> */
    }
  }
  return imageFromBlob(blob);
}

function sizeOf(img: LogoSource): [number, number] {
  return img instanceof HTMLImageElement ? [img.naturalWidth, img.naturalHeight] : [img.width, img.height];
}

/** The same block with a white face, the kind's gradient rim and the logo fitted inside */
function drawLogoMarker(img: LogoSource, kind: PointKind): ImageData | null {
  const ctx = canvas2d();
  if (!ctx) return null;
  const c = POINT_KIND_COLORS[kind];
  drawBody(ctx, kind, "rgba(255,255,255,0.98)");
  const { x, y, size, radius } = TILE;
  roundedRect(ctx, x, y, size, size, radius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const pad = 9;
  const box = size - pad * 2;
  const [nw, nh] = sizeOf(img);
  const w = nw || box;
  const h = nh || box;
  const k = Math.min(box / w, box / h);
  ctx.save();
  roundedRect(ctx, x + 4, y + 4, size - 8, size - 8, radius - 4);
  ctx.clip();
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, x + pad + (box - w * k) / 2, y + pad + (box - h * k) / 2, w * k, h * k);
  ctx.restore();

  const rim = ctx.createLinearGradient(x, y, x + size, y + size);
  rim.addColorStop(0, c.light);
  rim.addColorStop(1, c.dark);
  ctx.lineWidth = 4;
  ctx.strokeStyle = rim;
  roundedRect(ctx, x + 2, y + 2, size - 4, size - 4, radius - 2);
  ctx.stroke();
  return ctx.getImageData(0, 0, W, H);
}

/** Adds the logo marker under `id`; false when the image cannot be read (then the kind marker stays) */
export function addLogoIcon(map: mapboxgl.Map, id: string, img: LogoSource, kind: PointKind): boolean {
  try {
    const data = drawLogoMarker(img, kind);
    if (!data) return false;
    if (!map.hasImage(id)) map.addImage(id, data, { pixelRatio: RATIO });
    return true;
  } catch {
    return false;
  }
}
