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

const everyone = () => true;

export const NAV_ITEMS: NavItem[] = [
  { label: "Fleet map", href: "/maps", icon: Map, visible: everyone },
  { label: "Vessels", href: "/vessels", icon: Ship, visible: everyone },
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, visible: everyone },
  { label: "Documents", href: "/documents", icon: FileText, visible: canEdit },
  { label: "Activity log", href: "/activity", icon: Activity, visible: canEdit },
  { label: "Ports", href: "/ports", icon: Anchor, visible: canEdit },
  { label: "Team", href: "/team", icon: Users, visible: isAdmin },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
