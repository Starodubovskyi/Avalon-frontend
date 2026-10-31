import { cn } from "@/lib/utils";
import { roleIdOf } from "@/lib/network/format";
import { RoleBadge } from "../team/teamMeta";

/** Keyboard focus ring for custom controls (matches form fields) */
export const focusRing = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20";

export function PersonRoleBadge({ role, compact = false, className }: { role: string; compact?: boolean; className?: string }) {
  return (
    <RoleBadge
      roleId={roleIdOf(role)}
      className={cn(compact && "gap-1 px-2 py-0 text-[11px] [&>svg]:h-3 [&>svg]:w-3", className)}
    />
  );
}

/** Length counter; the over-limit state says so in words, not only in red */
export function CharCounter({ length, max, showFrom = 0, className }: { length: number; max: number; showFrom?: number; className?: string }) {
  if (length < showFrom) return null;
  const over = length > max;
  return (
    <span
      className={cn(
        "tabular text-[11px]",
        over ? "font-semibold text-bad" : length > max * 0.9 ? "text-stage-expected" : "text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      {over ? `${(length - max).toLocaleString("en-GB")} characters over the limit` : `${length.toLocaleString("en-GB")} / ${max.toLocaleString("en-GB")}`}
    </span>
  );
}

export function CountPill({ count, className, label }: { count: number; className?: string; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "tabular inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-primary-foreground",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
      <span className="sr-only"> {label}</span>
    </span>
  );
}
