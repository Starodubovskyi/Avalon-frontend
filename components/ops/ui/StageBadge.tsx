import { Anchor, CircleDot, Clock3, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_META } from "@/lib/vessels/status";
import type { VesselStage } from "@/lib/vessels/types";

const ICONS: Record<VesselStage, typeof Ship> = {
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
  const Icon = ICONS[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
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
        "inline-flex items-center gap-1 rounded-full bg-stage-unpaid/15 px-2 py-0.5 text-xs font-semibold text-stage-unpaid",
        className,
      )}
    >
      <span aria-hidden>●</span>
      Unpaid{days !== null ? ` · ${days}d` : ""}
    </span>
  );
}
