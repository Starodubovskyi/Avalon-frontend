import { useTranslations } from "next-intl";
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

const STAGE_RING: Record<VesselStage, string> = {
  expected: "ring-stage-expected/25",
  at_roads: "ring-stage-roads/25",
  in_port: "ring-stage-port/25",
  departed: "ring-stage-departed/25",
};

/** Stage pill in the stage colour (expected amber, roads teal, port blue, departed grey); label translated via common.stage */
export function StageBadge({
  stage,
  className,
  compact = false,
}: {
  stage: VesselStage;
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("common");
  const meta = STAGE_META[stage];
  const Icon = STAGE_ICON[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        STAGE_RING[stage],
        meta.soft,
        meta.text,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {compact ? t(`stageShort.${stage}`) : t(`stage.${stage}`)}
    </span>
  );
}

export function UnpaidBadge({ days, className }: { days: number | null; className?: string }) {
  const t = useTranslations("common");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-stage-unpaid px-2.5 py-1 text-[11px] font-bold text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2),0_4px_12px_-4px_hsl(var(--st-unpaid)/0.8)]",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
      {days !== null ? t("unpaidDays", { days }) : t("unpaid")}
    </span>
  );
}
