import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks screens that are design previews, so nobody mistakes them for live billing or settings */
export function PreviewNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-stage-expected/30 bg-stage-expected/[0.07] px-3.5 py-2.5 text-[13px] text-foreground/85",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-stage-expected" aria-hidden />
      <span>
        <span className="font-semibold">Preview.</span> {children}
      </span>
    </div>
  );
}
