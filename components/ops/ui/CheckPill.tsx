import { Check, Loader2, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckPillProps {
  label: string;
  done: boolean | null;
  hint?: string;
  editable?: boolean;
  busy?: boolean;
  size?: "sm" | "md";
  onToggle?: () => void;
}

/** Red until done, green after (client rule). Icon + text so colour is never the only signal. */
export function CheckPill({
  label,
  done,
  hint,
  editable = false,
  busy = false,
  size = "sm",
  onToggle,
}: CheckPillProps) {
  const Icon = busy ? Loader2 : done === null ? Minus : done ? Check : X;
  const state = done === null ? "hidden" : done ? "done" : "pending";
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide transition-all",
    size === "sm" ? "h-6 pl-1 pr-2 text-[10px]" : "h-9 pl-1.5 pr-3.5 text-xs",
    state === "done" && "border-ok/25 bg-ok/[0.08] text-ok",
    state === "pending" && "border-bad/25 bg-bad/[0.07] text-bad",
    state === "hidden" && "border-border bg-muted text-muted-foreground",
    editable &&
      "cursor-pointer hover:-translate-y-px hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:translate-y-0",
  );
  const dot = cn(
    "flex shrink-0 items-center justify-center rounded-full text-white",
    size === "sm" ? "h-4 w-4" : "h-6 w-6",
    state === "done" && "bg-ok",
    state === "pending" && "bg-bad",
    state === "hidden" && "bg-muted-foreground/40",
  );
  const content = (
    <>
      <span className={dot}>
        <Icon className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5", busy && "animate-spin")} strokeWidth={3} aria-hidden />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </>
  );
  const title = `${hint ?? label}: ${state === "done" ? "done" : state === "pending" ? "not done" : "hidden"}`;

  if (!editable) {
    return (
      <span className={classes} title={title}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      title={`${title} — click to change`}
      aria-pressed={done === true}
      disabled={busy}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
    >
      {content}
    </button>
  );
}
