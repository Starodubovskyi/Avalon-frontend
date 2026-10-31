import {
  Activity,
  Anchor,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Mail,
  Map,
  MessageCircle,
  Newspaper,
  Settings,
  Ship,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/lib/domain/map-point";
import { canEdit, isAdmin } from "@/lib/auth/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  visible: (user: AuthUser | null) => boolean;
  /** live badge key resolved by the sidebar (e.g. unread chat) */
  badge?: "chat";
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
      { label: "Line-up", href: "/lineup", icon: TrendingUp, visible: everyone },
      { label: "Ports", href: "/ports", icon: Anchor, visible: canEdit },
    ],
  },
  {
    label: "Network",
    items: [
      { label: "Chat", href: "/chat", icon: MessageCircle, visible: everyone, badge: "chat" },
      { label: "Feed", href: "/social", icon: Newspaper, visible: everyone },
      { label: "People", href: "/people", icon: UsersRound, visible: everyone },
      { label: "Companies", href: "/companies", icon: Building2, visible: canEdit },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Documents", href: "/documents", icon: FileText, visible: canEdit },
      { label: "Tasks", href: "/tasks", icon: ListChecks, visible: canEdit },
      { label: "Email", href: "/email", icon: Mail, visible: canEdit },
      { label: "Activity log", href: "/activity", icon: Activity, visible: canEdit },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/account", icon: UserRound, visible: everyone },
      { label: "Subscription", href: "/subscriptions", icon: CreditCard, visible: everyone },
      { label: "Settings", href: "/settings", icon: Settings, visible: everyone },
      { label: "Support", href: "/support", icon: LifeBuoy, visible: everyone },
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
