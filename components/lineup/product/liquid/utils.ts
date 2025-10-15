import { PORTS, type PortLite } from "@/components/lineup/ports/mockPorts";

/** Безопасная регулярка: Unicode если доступен, иначе ASCII-фолбэк */
const NON_ALNUM_UNICODE: RegExp = (() => {
  try {
    return new RegExp("[^\\p{L}\\p{N}\\s-]+", "gu");
  } catch {
    return /[^A-Za-z0-9\s-]+/g;
  }
})();

/** ——— классификация «Liquid» ——— */
export function isLiquid(v: any): boolean {
  const tCargo = v?.cargo?.type?.toLowerCase?.() ?? "";
  if (tCargo === "liquid") return true;

  const t = String(v?.vesselType ?? "").toLowerCase();
  if (t.includes("crude")) return false;
  if (t.includes("chemical")) return false;

  if (t.includes("lng")) return true;
  if (t.includes("lpg")) return true;
  if (t.includes("product")) return true; // Oil Products / Product Tanker
  if (t.includes("oil products")) return true;
  if (t.includes("bitumen") || t.includes("asphalt")) return true;

  return false;
}

export function hasSubType(v: any, sub: string): boolean {
  const t = String(v?.vesselType ?? "").toLowerCase();
  const g = String(v?.cargo?.grade ?? "").toLowerCase();
  const anyText = [t, g].join(" ");
  switch (sub) {
    case "lng":
      return t.includes("lng");
    case "lpg":
      return t.includes("lpg");
    case "products":
      return (
        t.includes("product") ||
        t.includes("oil products") ||
        g.includes("ulsd") ||
        g.includes("gasoline")
      );
    case "bitumen":
      return t.includes("bitumen") || t.includes("asphalt");
    default:
      return false;
  }
}

export function filterByQueryAndSubTypes(
  list: any[],
  q: string,
  subs: string[]
) {
  const query = (q ?? "").trim().toLowerCase();
  let rows = list;
  if (query) {
    rows = rows.filter((v) =>
      [
        v.name,
        v.vesselType,
        v.destinationPort,
        v.reportedDestination,
        v.currentPort,
        v.cargo?.grade,
        v.flag,
        v.imo,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .some((s) => s.includes(query))
    );
  }
  if (subs && subs.length) {
    rows = rows.filter((v) => subs.some((s) => hasSubType(v, s)));
  }
  return rows;
}

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/port of\s+/g, "")
    .replace(NON_ALNUM_UNICODE, "")
    .trim();

function findPortByNameLike(name?: string): PortLite | undefined {
  const target = norm(name || "");
  if (!target) return;
  return PORTS.find((p) => {
    const pn = norm(p.name);
    return target.includes(pn) || pn.includes(target);
  });
}

function offsetLatLng(port: PortLite, seed: string) {
  const hash = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  const dLat = ((hash % 7) - 3) * 0.01; // ~1 км
  const dLng = ((hash % 11) - 5) * 0.015; // ~1.5 км
  return { lat: port.lat + dLat, lng: port.lng + dLng };
}

/** добавляем примерные координаты, если их нет в моках  */
export function withApproxPositions(list: any[]) {
  return list.map((v) => {
    if (typeof v.lat === "number" && typeof v.lng === "number") return v;
    const byCurrent = findPortByNameLike(v.currentPort);
    const byDest = findPortByNameLike(
      v.destinationPort || v.reportedDestination
    );
    const base = byCurrent || byDest;
    if (!base) return v;
    const o = offsetLatLng(base, String(v.id ?? v.name ?? ""));
    return { ...v, lat: o.lat, lng: o.lng };
  });
}

/** ——— флаги (alpha-2, svg url) ——— */
const RI_BASE = 0x1f1e6;
function toCodePoints(str: string): number[] {
  const cps: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const hi = str.charCodeAt(i);
    if (hi >= 0xd800 && hi <= 0xdbff && i + 1 < str.length) {
      const lo = str.charCodeAt(++i);
      cps.push(((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000);
    } else cps.push(hi);
  }
  return cps;
}
export function emojiToAlpha2(emoji?: string): string | undefined {
  if (!emoji) return;
  const cps = toCodePoints(emoji).filter(
    (cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff
  );
  if (cps.length < 2) return;
  const a = String.fromCharCode(cps[0] - RI_BASE + 0x41);
  const b = String.fromCharCode(cps[1] - RI_BASE + 0x41);
  return `${a}${b}`.toLowerCase();
}

const COUNTRY_TO_ISO: Record<string, string> = {
  "united kingdom": "gb",
  panama: "pa",
  belgium: "be",
  cyprus: "cy",
  latvia: "lv",
  iran: "ir",
  norway: "no",
  liberia: "lr",
  singapore: "sg",
  malaysia: "my",
  "hong kong": "hk",
  malta: "mt",
};

export function nameToAlpha2(country?: string): string | undefined {
  if (!country) return;
  const c = country.trim();
  if (/^[A-Za-z]{2}$/.test(c)) return c.toLowerCase();
  return COUNTRY_TO_ISO[c.toLowerCase()];
}

export function alpha2FromVessel(v: any): string | undefined {
  return (
    emojiToAlpha2(v.flag) || nameToAlpha2(v.flag) || nameToAlpha2(v.country)
  );
}

export const flagImgUrl = (alpha2?: string) =>
  alpha2
    ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${alpha2}.svg`
    : "";

export function isAgri(v: any): boolean {
  const t = (v?.cargo?.type || "").toLowerCase();
  if (t === "agri") return true;
  const vt = (v?.vesselType || "").toLowerCase();
  const g = (v?.cargo?.grade || "").toLowerCase();
  return (
    vt.includes("bulk") &&
    (g.includes("wheat") ||
      g.includes("corn") ||
      g.includes("soy") ||
      g.includes("barley"))
  );
}

export function isFertilizers(v: any): boolean {
  const t = (v?.cargo?.type || "").toLowerCase();
  if (t === "fertilizers") return true;
  const g = (v?.cargo?.grade || "").toLowerCase();
  return (
    g.includes("urea") ||
    g.includes("dap") ||
    g.includes("map") ||
    g.includes("npk")
  );
}

export function isChemicals(v: any): boolean {
  const t = (v?.cargo?.type || "").toLowerCase();
  if (t === "chemicals") return true;
  const vt = (v?.vesselType || "").toLowerCase();
  const g = (v?.cargo?.grade || "").toLowerCase();
  return (
    vt.includes("chemical") || g.includes("methanol") || g.includes("caustic")
  );
}

export function isCrude(v: any): boolean {
  const t = (v?.cargo?.type || "").toLowerCase();
  if (t === "crude") return true;
  const vt = (v?.vesselType || "").toLowerCase();
  const g = (v?.cargo?.grade || "").toLowerCase();
  return (
    vt.includes("crude") ||
    g.includes("arab") ||
    g.includes("bonny") ||
    g.includes("urals") ||
    g.includes("brent")
  );
}

/** Пресеты чипов для поиска/фильтрации по подтипам */
export const CHIP_PRESETS = {
  liquid: [
    { key: "lng", label: "LNG", color: "emerald" as const },
    { key: "lpg", label: "LPG", color: "amber" as const },
    { key: "products", label: "Products", color: "rose" as const },
    { key: "bitumen", label: "Bitumen", color: "sky" as const },
  ],
  agri: [
    { key: "wheat", label: "Wheat", color: "amber" as const },
    { key: "corn", label: "Corn", color: "emerald" as const },
    { key: "soy", label: "Soy", color: "sky" as const },
    { key: "barley", label: "Barley", color: "rose" as const },
  ],
  fertilizers: [
    { key: "urea", label: "Urea", color: "emerald" as const },
    { key: "dap", label: "DAP", color: "amber" as const },
    { key: "map", label: "MAP", color: "sky" as const },
    { key: "npk", label: "NPK", color: "rose" as const },
  ],
  chemicals: [
    { key: "methanol", label: "Methanol", color: "emerald" as const },
    { key: "caustic", label: "Caustic", color: "amber" as const },
    { key: "aromatics", label: "Aromatics", color: "rose" as const },
    { key: "solvents", label: "Solvents", color: "sky" as const },
  ],
  crude: [
    { key: "arab", label: "Arab", color: "emerald" as const },
    { key: "bonny", label: "Bonny", color: "amber" as const },
    { key: "urals", label: "Urals", color: "sky" as const },
    { key: "brent", label: "Brent", color: "rose" as const },
  ],
} as const;
