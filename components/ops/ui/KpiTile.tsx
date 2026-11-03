import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiTone = "default" | "expected" | "roads" | "port" | "departed" | "unpaid";

/** Stage colours stay the semantic anchor: expected amber, roads teal, port blue, departed grey, unpaid crimson */
const TONE: Record<KpiTone, { text: string; chip: string; bar: string; glow: string }> = {
  default: { text: "text-foreground", chip: "bg-primary/10 text-primary ring-primary/15", bar: "from-primary/70 to-primary/0", glow: "bg-primary/10" },
  expected: {
    text: "text-foreground",
    chip: "bg-stage-expected/10 text-stage-expected ring-stage-expected/20",
    bar: "from-stage-expected to-stage-expected/0",
    glow: "bg-stage-expected/10",
  },
  roads: {
    text: "text-foreground",
    chip: "bg-stage-roads/10 text-stage-roads ring-stage-roads/20",
    bar: "from-stage-roads to-stage-roads/0",
    glow: "bg-stage-roads/10",
  },
  port: {
    text: "text-foreground",
    chip: "bg-stage-port/10 text-stage-port ring-stage-port/20",
    bar: "from-stage-port to-stage-port/0",
    glow: "bg-stage-port/10",
  },
  departed: {
    text: "text-foreground",
    chip: "bg-stage-departed/15 text-stage-departed ring-stage-departed/20",
    bar: "from-stage-departed to-stage-departed/0",
    glow: "bg-stage-departed/10",
  },
  unpaid: {
    text: "text-stage-unpaid",
    chip: "bg-stage-unpaid/10 text-stage-unpaid ring-stage-unpaid/25",
    bar: "from-stage-unpaid to-stage-unpaid/0",
    glow: "bg-stage-unpaid/15",
  },
};

export interface KpiTrend {
  /** short text, e.g. "+2 this week" */
  label: string;
  direction: "up" | "down" | "flat";
  /** whether the move is good news (green) or bad news (red); neutral when omitted */
  good?: boolean;
}

function Trend({ trend }: { trend: KpiTrend }) {
  const Icon = trend.direction === "up" ? ArrowUpRight : trend.direction === "down" ? ArrowDownRight : ArrowRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
        trend.good === undefined ? "bg-muted text-muted-foreground" : trend.good ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad",
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {trend.label}
    </span>
  );
}

export function KpiTile({
  label,
  value,
  tone = "default",
  icon,
  hint,
  trend,
  href,
  accent = true,
  className,
}: {
  label: string;
  value: ReactNode;
  tone?: KpiTone;
  icon?: ReactNode;
  hint?: string;
  trend?: KpiTrend;
  /** makes the whole tile a link (e.g. to the filtered board) */
  href?: string;
  /** stage-coloured hairline and corner glow */
  accent?: boolean;
  className?: string;
}) {
  const t = TONE[tone];
  const body = (
    <>
      {accent ? (
        <>
          <span aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r", t.bar)} />
          <span
            aria-hidden
            className={cn("pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-70 blur-2xl transition-opacity group-hover:opacity-100", t.glow)}
          />
        </>
      ) : null}
      <div className="relative flex items-start justify-between gap-2">
        <span className="min-w-0 text-[13px] font-medium leading-snug text-muted-foreground">{label}</span>
        {icon ? (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset [&>svg]:h-4 [&>svg]:w-4", t.chip)}>{icon}</span>
        ) : null}
      </div>
      <div className={cn("tabular relative mt-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em]", t.text)}>{value}</div>
      <div className="relative mt-2.5 flex min-h-[18px] flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {trend ? <Trend trend={trend} /> : null}
        {hint ? <span className="leading-snug">{hint}</span> : null}
      </div>
    </>
  );
  const classes = cn(
    "group relative block overflow-hidden rounded-2xl border bg-card p-4 shadow-card transition duration-200 ease-out",
    href && "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
    className,
  );
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
