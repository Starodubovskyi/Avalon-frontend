"use client";

import Image from "next/image";
import { Briefcase, Building, Building2, Landmark, Tag, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PointKind } from "@/lib/points/team-points";
import { usePointLogoUrl, type LogoRef } from "@/lib/points/logo-cache";

export const POINT_KIND_ICON: Record<PointKind, typeof Building2> = {
  head_office: Building2,
  branch: Building,
  self_employed: Briefcase,
  for_sale: Tag,
  authority: Landmark,
  private_person: UserRound,
};

interface KindClasses {
  /** soft tinted tile */
  tile: string;
  text: string;
  dot: string;
  ring: string;
  /** premium gradient tile (white glyph on top) */
  gradient: string;
  /** shadow-point-* from tailwind.config (colours in lib/points/kind-colors.ts) */
  glow: string;
}

/** Literal class names so Tailwind can see them (no string building) */
export const POINT_KIND_CLASS: Record<PointKind, KindClasses> = {
  head_office: {
    tile: "bg-point-head-office/10 text-point-head-office dark:bg-point-head-office/20 dark:text-point-head-office-light",
    text: "text-point-head-office dark:text-point-head-office-light",
    dot: "bg-point-head-office",
    ring: "ring-point-head-office/40",
    gradient: "bg-gradient-to-br from-point-head-office-light to-point-head-office-dark",
    glow: "shadow-point-head-office",
  },
  branch: {
    tile: "bg-point-branch/10 text-point-branch dark:bg-point-branch/20 dark:text-point-branch-light",
    text: "text-point-branch dark:text-point-branch-light",
    dot: "bg-point-branch",
    ring: "ring-point-branch/40",
    gradient: "bg-gradient-to-br from-point-branch-light to-point-branch-dark",
    glow: "shadow-point-branch",
  },
  self_employed: {
    tile: "bg-point-self-employed/10 text-point-self-employed dark:bg-point-self-employed/20 dark:text-point-self-employed-light",
    text: "text-point-self-employed dark:text-point-self-employed-light",
    dot: "bg-point-self-employed",
    ring: "ring-point-self-employed/40",
    gradient: "bg-gradient-to-br from-point-self-employed-light to-point-self-employed-dark",
    glow: "shadow-point-self-employed",
  },
  for_sale: {
    tile: "bg-point-for-sale/10 text-point-for-sale dark:bg-point-for-sale/20 dark:text-point-for-sale-light",
    text: "text-point-for-sale dark:text-point-for-sale-light",
    dot: "bg-point-for-sale",
    ring: "ring-point-for-sale/40",
    gradient: "bg-gradient-to-br from-point-for-sale-light to-point-for-sale-dark",
    glow: "shadow-point-for-sale",
  },
  authority: {
    tile: "bg-point-authority/10 text-point-authority dark:bg-slate-400/15 dark:text-slate-300",
    text: "text-point-authority dark:text-slate-300",
    dot: "bg-point-authority dark:bg-slate-400",
    ring: "ring-point-authority/40 dark:ring-slate-400/40",
    gradient: "bg-gradient-to-br from-point-authority-light to-point-authority-dark",
    glow: "shadow-point-authority",
  },
  private_person: {
    tile: "bg-point-private-person/10 text-point-private-person dark:bg-point-private-person/20 dark:text-point-private-person-light",
    text: "text-point-private-person dark:text-point-private-person-light",
    dot: "bg-point-private-person",
    ring: "ring-point-private-person/40",
    gradient: "bg-gradient-to-br from-point-private-person-light to-point-private-person-dark",
    glow: "shadow-point-private-person",
  },
};

/** Soft tinted kind tile (menus, form tiles) */
export function PointKindIcon({ kind, size = "md" }: { kind: PointKind; size?: "sm" | "md" }) {
  const Icon = POINT_KIND_ICON[kind];
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-xl", POINT_KIND_CLASS[kind].tile, size === "md" ? "h-10 w-10" : "h-8 w-8")}>
      <Icon className={size === "md" ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
    </span>
  );
}

const AVATAR_SIZE = {
  xs: { box: "h-6 w-6 rounded-md", icon: "h-3.5 w-3.5", px: 24 },
  sm: { box: "h-9 w-9 rounded-xl", icon: "h-4 w-4", px: 36 },
  md: { box: "h-11 w-11 rounded-xl", icon: "h-5 w-5", px: 44 },
  lg: { box: "h-16 w-16 rounded-2xl", icon: "h-7 w-7", px: 64 },
  xl: { box: "h-24 w-24 rounded-3xl", icon: "h-10 w-10", px: 96 },
} as const;

/** Logo on a white plate when the point has one, otherwise the kind glyph on its gradient */
export function PointAvatar({
  kind,
  logo,
  size = "md",
  className,
}: {
  kind: PointKind;
  logo?: string | null;
  size?: keyof typeof AVATAR_SIZE;
  className?: string;
}) {
  const s = AVATAR_SIZE[size];
  if (logo) {
    return (
      <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden bg-white ring-2", s.box, POINT_KIND_CLASS[kind].ring, className)}>
        <Image src={logo} alt="" width={s.px} height={s.px} unoptimized className="h-full w-full object-contain p-[10%]" />
      </span>
    );
  }
  const Icon = POINT_KIND_ICON[kind];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center text-white",
        s.box,
        POINT_KIND_CLASS[kind].gradient,
        size !== "xs" && POINT_KIND_CLASS[kind].glow,
        className,
      )}
    >
      <Icon className={s.icon} strokeWidth={2.2} aria-hidden />
    </span>
  );
}

/** PointAvatar for a stored point: fetches the logo (if any) through the logo cache */
export function PointLogoAvatar({
  point,
  size = "md",
  className,
}: {
  point: LogoRef & { kind: PointKind };
  size?: keyof typeof AVATAR_SIZE;
  className?: string;
}) {
  const logo = usePointLogoUrl(point);
  return <PointAvatar kind={point.kind} logo={logo} size={size} className={className} />;
}
