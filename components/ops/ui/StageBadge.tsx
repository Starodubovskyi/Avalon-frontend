import { Anchor, CircleDot, Clock3, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_META } from "@/lib/vessels/status";
import type { VesselStage } from "@/lib/vessels/types";

export const STAGE_ICON: Record<VesselStage, typeof Ship> = {
  expected: Clock3,
  at_roads: Anchor,
  in_port: CircleDot,
  departed: Ship,
};

export function StageBadge({
  stage,
  className,
  compact = false,
}: {
  stage: VesselStage;
  className?: string;
  compact?: boolean;
}) {
  const meta = STAGE_META[stage];
  const Icon = STAGE_ICON[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-semibold",
        meta.soft,
        meta.text,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {compact ? meta.short : meta.label}
    </span>
  );
}

export function UnpaidBadge({ days, className }: { days: number | null; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-stage-unpaid px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_4px_12px_-4px_hsl(var(--st-unpaid)/0.8)]",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
      Unpaid{days !== null ? ` · ${days}d` : ""}
    </span>
  );
}
