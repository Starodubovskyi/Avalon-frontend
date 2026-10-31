import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Always-visible disclaimer for depths, limits and tariffs on public pages */
export function IndicativeNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-stage-expected/30 bg-stage-expected/[0.08] px-4 py-3 text-[13px] leading-relaxed text-foreground/85",
        className,
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stage-expected/15 text-stage-expected">
        <Info className="h-4 w-4" aria-hidden />
      </span>
      <span className="pt-0.5">{children}</span>
    </div>
  );
}
