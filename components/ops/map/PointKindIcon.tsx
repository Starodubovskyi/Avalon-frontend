import { BadgeCheck, Briefcase, Building2, Landmark, UserRound, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PointKind } from "@/lib/points/team-points";

export const POINT_KIND_ICON: Record<PointKind, typeof Building2> = {
  company: Building2,
  agency: Briefcase,
  terminal: Warehouse,
  authority: Landmark,
  person: UserRound,
  employee: BadgeCheck,
};

/** Literal class names so Tailwind can see them (no string building) */
export const POINT_KIND_CLASS: Record<PointKind, { tile: string; text: string; dot: string; ring: string }> = {
  company: { tile: "bg-point-company/10 text-point-company", text: "text-point-company", dot: "bg-point-company", ring: "ring-point-company/40" },
  agency: { tile: "bg-point-agency/10 text-point-agency", text: "text-point-agency", dot: "bg-point-agency", ring: "ring-point-agency/40" },
  terminal: { tile: "bg-point-terminal/10 text-point-terminal", text: "text-point-terminal", dot: "bg-point-terminal", ring: "ring-point-terminal/40" },
  authority: { tile: "bg-point-authority/10 text-point-authority", text: "text-point-authority", dot: "bg-point-authority", ring: "ring-point-authority/40" },
  person: { tile: "bg-point-person/10 text-point-person", text: "text-point-person", dot: "bg-point-person", ring: "ring-point-person/40" },
  employee: { tile: "bg-point-employee/10 text-point-employee", text: "text-point-employee", dot: "bg-point-employee", ring: "ring-point-employee/40" },
};

export function PointKindIcon({ kind, size = "md" }: { kind: PointKind; size?: "sm" | "md" }) {
  const Icon = POINT_KIND_ICON[kind];
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-xl", POINT_KIND_CLASS[kind].tile, size === "md" ? "h-10 w-10" : "h-8 w-8")}>
      <Icon className={size === "md" ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
    </span>
  );
}
