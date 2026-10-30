import { Eye, ShieldCheck, UserCog, type LucideIcon } from "lucide-react";
import type { TeamMember } from "@/lib/api/team";
import { ROLE, ROLE_LABEL } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export const ROLE_OPTIONS = [ROLE.staff, ROLE.admin, ROLE.viewer];

export const ROLE_HELP: Record<number, string> = {
  [ROLE.admin]: "Everything, including team and deleting vessels",
  [ROLE.staff]: "Edits vessels, checklist, documents; sees the log",
  [ROLE.viewer]: "Read-only: status, dates and position, no contacts or payments",
};

export const ROLE_META: Record<number, { icon: LucideIcon; tint: string }> = {
  [ROLE.admin]: { icon: ShieldCheck, tint: "bg-primary/10 text-primary border-primary/25" },
  [ROLE.staff]: { icon: UserCog, tint: "bg-ok/10 text-ok border-ok/25" },
  [ROLE.viewer]: { icon: Eye, tint: "bg-muted text-muted-foreground border-border" },
};

export function memberName(m: TeamMember) {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || `#${m.id}`;
}

export function RoleBadge({ roleId, className }: { roleId: number; className?: string }) {
  const meta = ROLE_META[roleId] ?? ROLE_META[ROLE.viewer];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", meta.tint, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {ROLE_LABEL[roleId] ?? "User"}
    </span>
  );
}
