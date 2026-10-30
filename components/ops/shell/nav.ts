import {
  Activity,
  Anchor,
  FileText,
  LayoutDashboard,
  Map,
  Ship,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/lib/domain/map-point";
import { canEdit, isAdmin } from "@/lib/auth/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  visible: (user: AuthUser | null) => boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const everyone = () => true;

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, visible: everyone },
      { label: "Fleet map", href: "/maps", icon: Map, visible: everyone },
      { label: "Vessels", href: "/vessels", icon: Ship, visible: everyone },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Documents", href: "/documents", icon: FileText, visible: canEdit },
      { label: "Activity log", href: "/activity", icon: Activity, visible: canEdit },
      { label: "Ports", href: "/ports", icon: Anchor, visible: canEdit },
    ],
  },
  {
    label: "Admin",
    items: [{ label: "Team", href: "/team", icon: Users, visible: isAdmin }],
  },
];

/** Flat list for places that don't need grouping */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
