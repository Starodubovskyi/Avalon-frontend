/**
 * Colours of the map point kinds — the single source for canvas markers, Tailwind `point.*` colours
 * and the `shadow-point-*` glows. Plain module (no "use client"): tailwind.config.ts imports it too.
 */
export const POINT_KIND_COLORS = {
  head_office: { base: "#7c3aed", light: "#8b5cf6", dark: "#5b21b6" },
  branch: { base: "#0284c7", light: "#0ea5e9", dark: "#075985" },
  self_employed: { base: "#059669", light: "#10b981", dark: "#065f46" },
  for_sale: { base: "#e11d48", light: "#f43f5e", dark: "#9f1239" },
  authority: { base: "#475569", light: "#64748b", dark: "#1e293b" },
  private_person: { base: "#ea580c", light: "#f97316", dark: "#9a3412" },
} as const;

export type PointKindKey = keyof typeof POINT_KIND_COLORS;

export function hexToRgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Tailwind keys are kebab-case: head_office → head-office (classes like bg-point-head-office) */
function twKey(kind: PointKindKey): string {
  return kind.replace(/_/g, "-");
}

const KINDS = Object.keys(POINT_KIND_COLORS) as PointKindKey[];

/** theme.extend.colors.point */
export function tailwindPointColors(): Record<string, { DEFAULT: string; light: string; dark: string }> {
  return Object.fromEntries(
    KINDS.map((k) => [twKey(k), { DEFAULT: POINT_KIND_COLORS[k].base, light: POINT_KIND_COLORS[k].light, dark: POINT_KIND_COLORS[k].dark }]),
  );
}

/** theme.extend.boxShadow: shadow-point-<kind> — the soft coloured glow under gradient tiles */
export function tailwindPointGlows(): Record<string, string> {
  return Object.fromEntries(KINDS.map((k) => [`point-${twKey(k)}`, `0 10px 24px -8px ${hexToRgba(POINT_KIND_COLORS[k].base, 0.68)}`]));
}
