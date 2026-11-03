import {
  Activity,
  Anchor,
  BookOpen,
  Building2,
  Calculator,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Mail,
  Map,
  MessageCircle,
  Newspaper,
  Send,
  Settings,
  Ship,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/lib/domain/map-point";
import { canEdit, isAdmin } from "@/lib/auth/roles";

/** Keys of the `nav` dictionary: `nav.items.<key>` and `nav.groups.<group>` */
export type NavKey =
  | "overview"
  | "fleetMap"
  | "vessels"
  | "lineup"
  | "ports"
  | "requestAgency"
  | "requests"
  | "pdaEstimate"
  | "portGuide"
  | "chat"
  | "feed"
  | "people"
  | "companies"
  | "documents"
  | "tasks"
  | "email"
  | "activityLog"
  | "profile"
  | "balance"
  | "settings"
  | "support"
  | "team";

export type NavGroupKey = "operations" | "clients" | "network" | "workspace" | "account" | "admin";

export interface NavItem {
  key: NavKey;
  href: string;
  icon: LucideIcon;
  visible: (user: AuthUser | null) => boolean;
  /** live badge key resolved by the sidebar (unread chat, new agency requests) */
  badge?: "chat" | "requests";
}

export interface NavGroup {
  key: NavGroupKey;
  items: NavItem[];
}

const everyone = () => true;

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "operations",
    items: [
      { key: "overview", href: "/dashboard", icon: LayoutDashboard, visible: everyone },
      { key: "fleetMap", href: "/maps", icon: Map, visible: everyone },
      { key: "vessels", href: "/vessels", icon: Ship, visible: everyone },
      { key: "lineup", href: "/lineup", icon: TrendingUp, visible: everyone },
      { key: "ports", href: "/ports", icon: Anchor, visible: canEdit },
    ],
  },
  {
    key: "clients",
    items: [
      { key: "requestAgency", href: "/request", icon: Send, visible: everyone },
      { key: "requests", href: "/requests", icon: ClipboardList, visible: canEdit, badge: "requests" },
      { key: "pdaEstimate", href: "/estimate", icon: Calculator, visible: everyone },
      { key: "portGuide", href: "/port-guide", icon: BookOpen, visible: everyone },
    ],
  },
  {
    key: "network",
    items: [
      { key: "chat", href: "/chat", icon: MessageCircle, visible: everyone, badge: "chat" },
      { key: "feed", href: "/social", icon: Newspaper, visible: everyone },
      { key: "people", href: "/people", icon: UsersRound, visible: everyone },
      { key: "companies", href: "/companies", icon: Building2, visible: everyone },
    ],
  },
  {
    key: "workspace",
    items: [
      { key: "documents", href: "/documents", icon: FileText, visible: canEdit },
      { key: "tasks", href: "/tasks", icon: ListChecks, visible: canEdit },
      { key: "email", href: "/email", icon: Mail, visible: canEdit },
      { key: "activityLog", href: "/activity", icon: Activity, visible: canEdit },
    ],
  },
  {
    key: "account",
    items: [
      { key: "profile", href: "/account", icon: UserRound, visible: everyone },
      { key: "balance", href: "/balance", icon: Wallet, visible: everyone },
      { key: "settings", href: "/settings", icon: Settings, visible: everyone },
      { key: "support", href: "/support", icon: LifeBuoy, visible: everyone },
    ],
  },
  {
    key: "admin",
    items: [{ key: "team", href: "/team", icon: Users, visible: isAdmin }],
  },
];

/** Flat list for places that don't need grouping */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Title for a page below a section (e.g. /vessels/123): `nav.detail.<key>` */
export const DETAIL_TITLE: Partial<Record<string, "vesselCard" | "companyProfile" | "personProfile" | "portCard" | "portLineup">> = {
  "/vessels": "vesselCard",
  "/companies": "companyProfile",
  "/people": "personProfile",
  "/ports": "portCard",
  "/lineup": "portLineup",
};

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The menu entry and its group for a path, if any */
export function findNav(pathname: string): { item: NavItem; group: NavGroup } | null {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => isActive(pathname, i.href));
    if (item) return { item, group };
  }
  return null;
}
