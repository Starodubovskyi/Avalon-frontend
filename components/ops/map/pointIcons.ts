import type mapboxgl from "mapbox-gl";
import { POINT_KINDS, POINT_KIND_HEX, type PointKind } from "@/lib/points/team-points";

const SIZE = 56;

export function pointIconId(kind: PointKind): string {
  return `av-pt-${kind}`;
}

/** Small white glyph inside the pin, one per kind (building, briefcase, warehouse, landmark, person, badge) */
function glyph(ctx: CanvasRenderingContext2D, kind: PointKind, cx: number, cy: number) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  if (kind === "company") {
    ctx.fillRect(cx - 8, cy - 7, 7, 15);
    ctx.fillRect(cx + 1, cy - 2, 7, 10);
    ctx.fillStyle = POINT_KIND_HEX.company;
    for (const [x, y] of [[-6, -4], [-3, -4], [-6, 0], [-3, 0], [3, 1], [6, 1]] as const) {
      ctx.fillRect(cx + x, cy + y, 1.6, 2);
    }
    return;
  }
  if (kind === "agency") {
    // briefcase: handle + body + clasp
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 3.5, cy - 8, 7, 4);
    ctx.fillRect(cx - 9, cy - 4, 18, 12);
    ctx.fillStyle = POINT_KIND_HEX.agency;
    ctx.fillRect(cx - 9, cy + 0.5, 18, 1.6);
    ctx.fillRect(cx - 1.5, cy - 0.5, 3, 3.5);
    return;
  }
  if (kind === "terminal") {
    // warehouse: gabled roof + walls + door
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 1);
    ctx.lineTo(cx, cy - 9);
    ctx.lineTo(cx + 10, cy - 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 8, cy - 1, 16, 9);
    ctx.fillStyle = POINT_KIND_HEX.terminal;
    ctx.fillRect(cx - 3, cy + 2, 6, 6);
    return;
  }
  if (kind === "authority") {
    // landmark: pediment, three columns, base
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 3);
    ctx.lineTo(cx, cy - 9);
    ctx.lineTo(cx + 10, cy - 3);
    ctx.closePath();
    ctx.fill();
    for (const x of [-7, -1.5, 4]) ctx.fillRect(cx + x, cy - 2, 3, 8);
    ctx.fillRect(cx - 10, cy + 6, 20, 2.5);
    return;
  }
  // head + shoulders
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy + 9, 8, Math.PI, 0);
  ctx.fill();
  if (kind === "employee") {
    // badge tick on the chest
    ctx.fillStyle = POINT_KIND_HEX.employee;
    ctx.fillRect(cx - 2.5, cy + 3, 5, 2.4);
  }
}

function draw(kind: PointKind, outline: string): ImageData | null {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const cx = SIZE / 2;
  const cy = 22;
  // teardrop pin
  ctx.beginPath();
  ctx.moveTo(cx, SIZE - 3);
  ctx.bezierCurveTo(cx - 6, 42, cx - 17, 34, cx - 17, cy);
  ctx.arc(cx, cy, 17, Math.PI, 0);
  ctx.bezierCurveTo(cx + 17, 34, cx + 6, 42, cx, SIZE - 3);
  ctx.closePath();
  ctx.fillStyle = POINT_KIND_HEX[kind];
  ctx.lineWidth = 3;
  ctx.strokeStyle = outline;
  ctx.stroke();
  ctx.fill();
  glyph(ctx, kind, cx, cy);
  return ctx.getImageData(0, 0, SIZE, SIZE);
}

export function installPointIcons(map: mapboxgl.Map, dark: boolean): void {
  const outline = dark ? "rgba(2,6,23,0.9)" : "rgba(255,255,255,0.98)";
  for (const kind of POINT_KINDS) {
    const id = pointIconId(kind);
    const img = draw(kind, outline);
    if (!img) continue;
    if (map.hasImage(id)) map.removeImage(id);
    map.addImage(id, img, { pixelRatio: 2 });
  }
}
