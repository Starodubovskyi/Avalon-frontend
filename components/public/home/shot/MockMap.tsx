import { Layers, MessageCircle, Minus, Plus, Share2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandSeal } from "@/components/public/brand/BrandSeal";
import { COAST_PATH, DANUBE_PORTS, MAIN_ROUTE, SEA_PATH, SIDE_ARMS, TRIBUTARIES } from "@/components/public/brand/danube";

/**
 * The map keeps its proportions (meet) inside any card; these extensions carry the rivers and the sea
 * past the drawing box so the letterbox bands read as more map, not empty space.
 */
const SEA_EXT = `${SEA_PATH} M 935 -400 L 940 0 L 1600 0 L 1600 -400 Z M 912 420 L 905 820 L 1600 820 L 1600 420 Z M 1000 0 L 1600 0 L 1600 420 L 1000 420 Z`;
const COAST_EXT = `M 935 -400 C 925 -250 945 -100 940 0 ${COAST_PATH.replace(/^M 940 0/, "")} C 900 520 925 700 905 820`;
const MAIN_EXT = `${MAIN_ROUTE} C 55 520 52 700 40 820`;
const ARMS_EXT = [`${SIDE_ARMS[0]}`, `${SIDE_ARMS[1]} C 900 460 940 520 990 560`];
const TRIB_EXT = [`${TRIBUTARIES[0]} C 210 -80 185 -220 200 -400`, `${TRIBUTARIES[1]} C -80 64 -260 40 -500 30`];

/** Vessel arrows on the river: position, heading and stage tone */
const VESSELS = [
  { x: 958, y: 314, r: -95, tone: "fill-stage-roads" },
  { x: 976, y: 284, r: -100, tone: "fill-stage-roads" },
  { x: 690, y: 295, r: -92, tone: "fill-stage-expected" },
  { x: 497, y: 162, r: 20, tone: "fill-stage-port" },
  { x: 230, y: 106, r: -40, tone: "fill-stage-port" },
  { x: 300, y: 190, r: -60, tone: "fill-stage-expected" },
];

/** Company geopoints: "building" markers with a gradient, as on the fleet map; placed clear of the port labels */
const POINTS = [
  { x: 790, y: 226, grad: "violet", label: "RANK 980" },
  { x: 586, y: 214, grad: "teal", label: "RANK 640" },
  { x: 40, y: 300, grad: "amber", label: null },
  { x: 372, y: 334, grad: "indigo", label: null },
] as const;

const GRADIENTS = {
  violet: ["#8b5cf6", "#5b21b6"],
  teal: ["#2dd4bf", "#0f766e"],
  amber: ["#fbbf24", "#b45309"],
  indigo: ["#818cf8", "#3730a3"],
} as const;

function Building({ x, y, grad, prefix }: { x: number; y: number; grad: keyof typeof GRADIENTS; prefix: string }) {
  return (
    <g transform={`translate(${x - 18} ${y - 18})`}>
      <rect x={-7} y={-7} width={50} height={50} rx={17} fill={GRADIENTS[grad][0]} opacity={0.2} />
      <rect width={36} height={36} rx={11} fill={`url(#${prefix}-${grad})`} stroke="white" strokeWidth={2.5} />
      {/* building glyph */}
      <path d="M12 27 V13 h7 v14 M19 17 h5 v10 M10 27 h16" stroke="white" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * Fleet map card: the schematic Danube in theme colours with vessels, company geopoints and,
 * optionally, the map chrome and an open point card.
 */
export function MockMap({
  idPrefix,
  labels = true,
  chrome = true,
  card = true,
  viewBox = "40 30 960 380",
  className,
}: {
  idPrefix: string;
  labels?: boolean;
  chrome?: boolean;
  card?: boolean;
  /** crop of the 1000 × 420 drawing; a tighter box zooms in */
  viewBox?: string;
  className?: string;
}) {
  // labels of ports outside the crop would show as clipped fragments at the edge
  const [minX, , width] = viewBox.split(/\s+/).map(Number);
  const inCrop = (x: number) => x >= minX && x <= minX + width;
  return (
    <div className={cn("map-grid relative min-h-[200px] overflow-hidden rounded-xl border bg-muted shadow-card", className)}>
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden fill="none">
        <defs>
          {Object.entries(GRADIENTS).map(([k, [a, b]]) => (
            <linearGradient key={k} id={`${idPrefix}-${k}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={a} />
              <stop offset="1" stopColor={b} />
            </linearGradient>
          ))}
        </defs>
        <path d={SEA_EXT} className="fill-primary/[0.12]" />
        <path d={COAST_EXT} className="stroke-primary/30" strokeWidth={2} />
        {TRIB_EXT.map((d) => (
          <path key={d} d={d} className="stroke-primary/20" strokeWidth={5} strokeLinecap="round" />
        ))}
        {ARMS_EXT.map((d) => (
          <path key={d} d={d} className="stroke-primary/25" strokeWidth={8} strokeLinecap="round" />
        ))}
        <path d={MAIN_EXT} className="stroke-primary/30" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
        <path d={MAIN_EXT} className="stroke-card" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />

        {DANUBE_PORTS.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={7} className="fill-card stroke-foreground/45" strokeWidth={3} />
            {labels && inCrop(p.x) ? (
              <text x={p.x + p.dx} y={p.y + p.dy} textAnchor={p.anchor} className="fill-foreground/65 text-[22px] font-semibold">
                {p.name}
              </text>
            ) : null}
          </g>
        ))}

        {VESSELS.map((v) => (
          <g key={`${v.x}-${v.y}`} transform={`translate(${v.x} ${v.y}) rotate(${v.r})`}>
            <path d="M0 -14 L10 11 L0 5.5 L-10 11 Z" className={cn(v.tone, "stroke-card")} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
        ))}

        {POINTS.map((p) => (
          <g key={`${p.x}-${p.y}`}>
            <Building x={p.x} y={p.y} grad={p.grad} prefix={idPrefix} />
            {p.label ? (
              <g transform={`translate(${p.x} ${p.y + 36})`}>
                <rect x={-48} y={-14} width={96} height={26} rx={13} className="fill-card stroke-border" strokeWidth={1.5} />
                <text x={0} y={5} textAnchor="middle" className="fill-foreground text-[14px] font-bold tracking-wide">
                  {p.label}
                </text>
              </g>
            ) : null}
          </g>
        ))}
      </svg>

      {chrome ? (
        <>
          <div className="absolute left-2.5 top-2.5 flex gap-1">
            {["Vessels", "Companies", "★ Favorites"].map((l, i) => (
              <span
                key={l}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold shadow-card",
                  i < 2 ? "border-primary/20 bg-card text-foreground" : "hidden bg-card/80 text-muted-foreground sm:inline",
                )}
              >
                {l}
              </span>
            ))}
          </div>
          <div className="absolute right-2.5 top-2.5 flex flex-col overflow-hidden rounded-lg border bg-card text-muted-foreground shadow-card">
            <span className="flex h-6 w-6 items-center justify-center border-b">
              <Plus className="h-3 w-3" aria-hidden />
            </span>
            <span className="flex h-6 w-6 items-center justify-center border-b">
              <Minus className="h-3 w-3" aria-hidden />
            </span>
            <span className="flex h-6 w-6 items-center justify-center">
              <Layers className="h-3 w-3" aria-hidden />
            </span>
          </div>
        </>
      ) : null}
      {card ? <PointCard className="glass absolute bottom-2.5 left-2.5 hidden w-[188px] shadow-elevated sm:block" /> : null}
    </div>
  );
}

/** The open geopoint card: logo, title, Business Activity, Rank and the Chat / Share / Favorite actions */
export function PointCard({ className, large = false }: { className?: string; large?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-2.5", large && "rounded-2xl p-4", className)}>
      <div className="flex items-center gap-2.5">
        <BrandSeal size={large ? "md" : "xs"} />
        <div className="min-w-0">
          <p className={cn("truncate font-bold leading-tight", large ? "text-[15px]" : "text-[12px]")}>Avalon Shipping SRL</p>
          <p className={cn("truncate text-muted-foreground", large ? "text-xs" : "text-[10px]")}>Company head office</p>
        </div>
      </div>
      <div className={cn("flex items-center justify-between gap-2", large ? "mt-4 rounded-xl bg-muted/60 px-3 py-2.5" : "mt-2")}>
        <span className="min-w-0">
          {large ? <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Business Activity</span> : null}
          <span className={cn("block truncate font-medium text-foreground/85", large ? "text-sm" : "text-[11px]")}>Ship agency</span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-md bg-gradient-to-r from-violet-500 to-indigo-600 font-extrabold tracking-wider text-white",
            large ? "px-2 py-1 text-[11px]" : "px-1.5 py-0.5 text-[9px]",
          )}
        >
          RANK 980
        </span>
      </div>
      <div className={cn("grid grid-cols-3 gap-1", large ? "mt-3 gap-1.5" : "mt-2")}>
        {[
          { icon: MessageCircle, label: "Chat" },
          { icon: Share2, label: "Share" },
          { icon: Star, label: "Saved" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className={cn(
              "flex items-center justify-center gap-1 rounded-md bg-muted font-semibold text-foreground/80",
              large ? "h-9 rounded-lg text-xs" : "h-7 text-[10px]",
            )}
          >
            <Icon className={cn(large ? "h-3.5 w-3.5" : "h-3 w-3", label === "Saved" && "fill-amber-400 text-amber-500")} aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
