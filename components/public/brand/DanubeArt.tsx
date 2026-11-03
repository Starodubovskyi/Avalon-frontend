import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  COAST_PATH,
  COUNTRY_LABELS,
  DANUBE_PORTS,
  DANUBE_VIEWBOX,
  MAIN_ROUTE,
  PULSE_DELAYS,
  SEA_PATH,
  SIDE_ARMS,
  TRIBUTARIES,
} from "./danube";

/**
 * Line drawing of the Lower Danube for navy surfaces: river arms, the Black Sea coast,
 * port dots with soft pulses and a bright dash travelling from the Sulina roads upstream.
 */
export function DanubeArt({
  id,
  labels = false,
  countries = false,
  strong = false,
  className,
  title,
}: {
  /** unique per page: prefixes the gradient id (two copies may coexist, one hidden by CSS) */
  id: string;
  /** port names next to the dots (hidden on phones, where the text would be too small) */
  labels?: boolean;
  countries?: boolean;
  /** brighter rivers for the coverage map; the faint default suits a background */
  strong?: boolean;
  className?: string;
  /** accessible name; without it the drawing is decorative */
  title?: string;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  return (
    <svg
      viewBox={DANUBE_VIEWBOX}
      className={cn("h-auto w-full overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
    >
      <defs>
        {/* the sea fades out at the top and bottom instead of ending in a hard box */}
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:hsl(var(--brand-accent))]" stopOpacity={0} />
          <stop offset="0.5" className="[stop-color:hsl(var(--brand-accent))]" stopOpacity={strong ? 0.12 : 0.08} />
          <stop offset="1" className="[stop-color:hsl(var(--brand-accent))]" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-coast`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity={0} />
          <stop offset="0.5" stopColor="white" stopOpacity={0.3} />
          <stop offset="1" stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={SEA_PATH} fill={`url(#${id}-sea)`} />
      <path d={COAST_PATH} stroke={`url(#${id}-coast)`} strokeWidth={1.5} strokeDasharray="3 6" />
      <text
        x={968}
        y={215}
        transform="rotate(90 968 215)"
        textAnchor="middle"
        className="fill-white/35 text-[15px] font-semibold tracking-[0.5em]"
      >
        {t("blackSea").toLocaleUpperCase(locale)}
      </text>

      {countries
        ? COUNTRY_LABELS.map((c) => (
            <text
              key={c.code}
              x={c.x}
              y={c.y}
              textAnchor="middle"
              className="hidden fill-white/25 text-[15px] font-semibold tracking-[0.45em] sm:block"
            >
              {t(`country.${c.code}`).toLocaleUpperCase(locale)}
            </text>
          ))
        : null}

      {TRIBUTARIES.map((d) => (
        <path key={d} d={d} className="stroke-white/10" strokeWidth={3} strokeLinecap="round" />
      ))}
      {SIDE_ARMS.map((d) => (
        <path key={d} d={d} className={strong ? "stroke-white/25" : "stroke-white/15"} strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* the river body: a wide soft halo under a crisp line */}
      <path d={MAIN_ROUTE} className="stroke-[hsl(var(--brand-glow)/0.25)]" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={MAIN_ROUTE}
        className={strong ? "stroke-white/55" : "stroke-white/30"}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={MAIN_ROUTE}
        pathLength={1000}
        className="route-flow stroke-[hsl(var(--brand-accent))]"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {DANUBE_PORTS.map((p, i) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={8} className={cn("route-pulse", PULSE_DELAYS[i % PULSE_DELAYS.length], "fill-[hsl(var(--brand-accent)/0.6)]")} />
          <circle cx={p.x} cy={p.y} r={11} className="fill-[hsl(var(--brand-deep))] stroke-[hsl(var(--brand-accent)/0.7)]" strokeWidth={2} />
          <circle cx={p.x} cy={p.y} r={5} className={p.sea ? "fill-[hsl(var(--brand-accent))]" : "fill-white"} />
          {labels ? (
            <text
              x={p.x + p.dx}
              y={p.y + p.dy}
              textAnchor={p.anchor}
              className="hidden fill-white/80 text-[20px] font-semibold sm:block"
            >
              {p.name}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
