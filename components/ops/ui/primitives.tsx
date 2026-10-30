import { forwardRef, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared button looks — plain class strings so links and buttons stay native elements */
export const btn = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_16px_-6px_hsl(var(--primary)/0.6)] transition hover:brightness-110 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium text-foreground shadow-card transition hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-bad/30 bg-card px-4 text-sm font-medium text-bad transition hover:bg-bad/5 disabled:opacity-50",
  icon:
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-40",
};

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
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
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
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold">{title}</h2>
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

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {icon ? (
        <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
          {icon}
        </div>
      ) : null}
      <p className="font-semibold">{title}</p>
      {text ? <p className="max-w-sm text-sm text-muted-foreground">{text}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground", className)} aria-label="Loading" />;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Spinner /> {label}
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-bad/25 bg-bad/5 px-4 py-3 text-sm text-bad">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="shrink-0 font-semibold underline underline-offset-2">
          Retry
        </button>
      ) : null}
    </div>
  );
}

const fieldBase =
  "w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground shadow-[0_1px_2px_hsl(var(--shadow-color)/0.04)] transition placeholder:text-muted-foreground/80 hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, "h-10", className)} {...props} />;
  },
);

export const SelectInput = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectInput({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(fieldBase, "h-10 cursor-pointer pr-8", className)} {...props}>
        {children}
      </select>
    );
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, "min-h-[88px] py-2.5", className)} {...props} />;
  },
);

export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-foreground/80">{label}</span>
      {children}
      {error ? <span className="text-xs text-bad">{error}</span> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

type Tone = "default" | "expected" | "roads" | "port" | "departed" | "unpaid";

const TONE: Record<Tone, { text: string; chip: string }> = {
  default: { text: "text-foreground", chip: "bg-primary/10 text-primary" },
  expected: { text: "text-foreground", chip: "bg-stage-expected/10 text-stage-expected" },
  roads: { text: "text-foreground", chip: "bg-stage-roads/10 text-stage-roads" },
  port: { text: "text-foreground", chip: "bg-stage-port/10 text-stage-port" },
  departed: { text: "text-foreground", chip: "bg-stage-departed/15 text-stage-departed" },
  unpaid: { text: "text-stage-unpaid", chip: "bg-stage-unpaid/10 text-stage-unpaid" },
};

export function KpiTile({
  label,
  value,
  tone = "default",
  icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  hint?: string;
}) {
  const t = TONE[tone];
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.chip)}>{icon}</span>
      </div>
      <div className={cn("tabular mt-1 font-display text-[34px] font-bold leading-none", t.text)}>{value}</div>
      {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : <div className="mt-2 h-4" />}
    </div>
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
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        AVATAR_TINTS[Math.abs(h) % AVATAR_TINTS.length],
        className,
      )}
      aria-hidden
    >
      {letters}
    </span>
  );
}
