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
    "inline-flex items-center gap-1 rounded-md border font-semibold tracking-wide transition-colors",
    size === "sm" ? "h-6 px-1.5 text-[10px]" : "h-8 px-2.5 text-xs",
    state === "done" && "border-ok/30 bg-ok/10 text-ok",
    state === "pending" && "border-bad/30 bg-bad/10 text-bad",
    state === "hidden" && "border-border bg-muted text-muted-foreground",
    editable && "cursor-pointer hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );
  const content = (
    <>
      <Icon className={cn("h-3 w-3 shrink-0", busy && "animate-spin")} aria-hidden />
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
