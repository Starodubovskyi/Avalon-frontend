import type mapboxgl from "mapbox-gl";

export type IconShape = "arrow" | "dot" | "est";
export type IconTone = "expected" | "at_roads" | "in_port" | "departed" | "unpaid";

const TONE_VAR: Record<IconTone, string> = {
  expected: "--st-expected",
  at_roads: "--st-roads",
  in_port: "--st-port",
  departed: "--st-departed",
  unpaid: "--st-unpaid",
};

export const SHAPES: IconShape[] = ["arrow", "dot", "est"];
export const TONES: IconTone[] = ["expected", "at_roads", "in_port", "departed", "unpaid"];

export function iconId(shape: IconShape, tone: IconTone): string {
  return `av-${shape}-${tone}`;
}

export function toneColor(tone: IconTone): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(TONE_VAR[tone]).trim();
  return raw ? `hsl(${raw})` : "#64748b";
}

const SIZE = 48;

function draw(shape: IconShape, color: string, outline: string): ImageData | null {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = outline;
  ctx.fillStyle = color;

  if (shape === "arrow") {
    // pointed hull, bow up (north); rotated by course on the map
    ctx.beginPath();
    ctx.moveTo(24, 4);
    ctx.lineTo(37, 40);
    ctx.lineTo(24, 33);
    ctx.lineTo(11, 40);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  } else if (shape === "dot") {
    ctx.beginPath();
    ctx.arc(24, 24, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(24, 10);
    ctx.lineTo(38, 24);
    ctx.lineTo(24, 38);
    ctx.lineTo(10, 24);
    ctx.closePath();
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  return ctx.getImageData(0, 0, SIZE, SIZE);
}

/** (Re)registers all icons; call after every style load because setStyle drops images */
export function installShipIcons(map: mapboxgl.Map, dark: boolean): void {
  const outline = dark ? "rgba(2,6,23,0.9)" : "rgba(255,255,255,0.95)";
  for (const shape of SHAPES) {
    for (const tone of TONES) {
      const id = iconId(shape, tone);
      const img = draw(shape, toneColor(tone), outline);
      if (!img) continue;
      if (map.hasImage(id)) map.removeImage(id);
      map.addImage(id, img, { pixelRatio: 2 });
    }
  }
}
