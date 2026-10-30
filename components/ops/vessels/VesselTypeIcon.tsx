import { Container, Fuel, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_META, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { TYPE_LABEL, type VesselType, type VesselView } from "@/lib/vessels/types";

const TYPE_ICON: Record<VesselType, typeof Container> = {
  general_cargo: Container,
  tanker: Fuel,
  livestock: PawPrint,
};

/** Rounded tile with the vessel-type glyph, tinted by stage (or the unpaid colour) */
export function VesselTypeIcon({ vessel, size = "md" }: { vessel: VesselView; size?: "sm" | "md" | "lg" }) {
  const Icon = TYPE_ICON[vessel.type];
  const unpaid = isUnpaidAfterDeparture(vessel);
  return (
    <span
      title={TYPE_LABEL[vessel.type]}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-10 w-10",
        size === "lg" && "h-14 w-14 rounded-2xl",
        unpaid ? "bg-stage-unpaid/10 text-stage-unpaid" : cn(STAGE_META[vessel.stage].soft, STAGE_META[vessel.stage].text),
      )}
    >
      <Icon className={size === "lg" ? "h-7 w-7" : size === "md" ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
    </span>
  );
}
