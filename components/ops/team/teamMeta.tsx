"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Eye, ShieldCheck, UserCog, type LucideIcon } from "lucide-react";
import type { TeamMember } from "@/lib/api/team";
import { ROLE } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export const ROLE_OPTIONS = [ROLE.staff, ROLE.admin, ROLE.viewer];

/** English role help, kept for existing importers; screens use useRoleText().help */
export const ROLE_HELP: Record<number, string> = {
  [ROLE.admin]: "Everything, including team and deleting vessels",
  [ROLE.staff]: "Edits vessels, checklist, documents; sees the log",
  [ROLE.viewer]: "Vessel status, dates and position; own company points, agency requests and chat. No checklist, contacts or payments",
};

export const ROLE_META: Record<number, { icon: LucideIcon; tint: string }> = {
  [ROLE.admin]: { icon: ShieldCheck, tint: "bg-primary/10 text-primary border-primary/25" },
  [ROLE.staff]: { icon: UserCog, tint: "bg-ok/10 text-ok border-ok/25" },
  [ROLE.viewer]: { icon: Eye, tint: "bg-muted text-muted-foreground border-border" },
};

const ROLE_KEY: Record<number, "admin" | "staff" | "viewer"> = {
  [ROLE.admin]: "admin",
  [ROLE.staff]: "staff",
  [ROLE.viewer]: "viewer",
};

/** Role name and one-line help in the interface language */
export function useRoleText() {
  const t = useTranslations("team");
  return useMemo(
    () => ({
      label: (roleId: number | null | undefined) => {
        const key = roleId ? ROLE_KEY[roleId] : undefined;
        return key ? t(`roles.${key}`) : t("roles.user");
      },
      help: (roleId: number) => {
        const key = ROLE_KEY[roleId];
        return key ? t(`roleHelp.${key}`) : "";
      },
    }),
    [t],
  );
}

export function memberName(m: TeamMember) {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || `#${m.id}`;
}

export function RoleBadge({ roleId, className }: { roleId: number; className?: string }) {
  const { label } = useRoleText();
  const meta = ROLE_META[roleId] ?? ROLE_META[ROLE.viewer];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", meta.tint, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label(roleId)}
    </span>
  );
}
