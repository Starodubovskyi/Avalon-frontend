import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Ops design primitives. Split by concern (buttons, feedback, fields, KPI tile) and re-exported here,
 * so every screen keeps importing from "components/ops/ui/primitives".
 */
export { btn } from "./buttons";
export { EmptyState, ErrorBlock, LoadingBlock, Spinner } from "./feedback";
export { Field, SelectInput, TextArea, TextInput } from "./fields";
export { KpiTile, type KpiTone, type KpiTrend } from "./KpiTile";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-eyebrow text-primary">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance font-display text-[26px] font-extrabold leading-[1.15] tracking-[-0.028em] sm:text-[30px]">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card text-card-foreground shadow-card", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 [&>svg]:h-4 [&>svg]:w-4">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate font-display text-[15px] font-bold tracking-[-0.01em]">{title}</h2>
              {description ? <p className="truncate text-xs text-muted-foreground">{description}</p> : null}
            </div>
          </div>
          {action}
        </header>
      ) : null}
      <div className={cn("p-5", title ? "pt-3" : "", bodyClassName)}>{children}</div>
    </section>
  );
}

export type BadgeTone = "neutral" | "primary" | "ok" | "bad" | "expected" | "roads" | "port" | "departed" | "unpaid";

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
  ok: "border-ok/25 bg-ok/10 text-ok",
  bad: "border-bad/25 bg-bad/10 text-bad",
  expected: "border-stage-expected/25 bg-stage-expected/10 text-stage-expected",
  roads: "border-stage-roads/25 bg-stage-roads/10 text-stage-roads",
  port: "border-stage-port/25 bg-stage-port/10 text-stage-port",
  departed: "border-stage-departed/25 bg-stage-departed/10 text-stage-departed",
  unpaid: "border-stage-unpaid/25 bg-stage-unpaid/10 text-stage-unpaid",
};

/** Small status pill; pass `dot` for a leading status dot */
export function Badge({
  tone = "neutral",
  dot = false,
  children,
  className,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        BADGE_TONE[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

const AVATAR_TINTS = [
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
];

export function Avatar({ name, className }: { name: string; className?: string }) {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  const letters = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "•";
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold tracking-wide ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
        AVATAR_TINTS[Math.abs(h) % AVATAR_TINTS.length],
        className,
      )}
      aria-hidden
    >
      {letters}
    </span>
  );
}
