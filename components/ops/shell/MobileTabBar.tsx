"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Map, Menu, MessageCircle, Ship, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatUnread } from "@/lib/network/hooks";
import { isActive } from "./nav";

const TABS: { href: string; label: string; icon: LucideIcon; badge?: boolean }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/maps", label: "Map", icon: Map },
  { href: "/vessels", label: "Vessels", icon: Ship },
  { href: "/chat", label: "Chat", icon: MessageCircle, badge: true },
];

const TAB =
  "relative flex h-full flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-colors active:scale-95";

/** Phone navigation: the four sections people open most, plus the full menu */
export function MobileTabBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname() ?? "";
  const { data: unread } = useChatUnread();
  const chatUnread = unread?.total ?? 0;
  const inTabs = TABS.some((t) => isActive(pathname, t.href));

  return (
    <nav
      aria-label="Quick navigation"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.25)] lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((t) => {
          const active = isActive(pathname, t.href);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className={cn(TAB, active ? "text-primary" : "text-muted-foreground")}>
                <span className={cn("flex h-8 w-12 items-center justify-center rounded-full transition-colors", active && "bg-primary/10")}>
                  <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.4 : 2} aria-hidden />
                </span>
                {t.label}
                {t.badge && chatUnread > 0 ? (
                  <span className="tabular absolute right-[calc(50%-22px)] top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card">
                    {chatUnread > 99 ? "99+" : chatUnread}
                    <span className="sr-only"> unread messages</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onMenu} className={cn(TAB, "w-full", inTabs ? "text-muted-foreground" : "text-primary")}>
            <span className={cn("flex h-8 w-12 items-center justify-center rounded-full", !inTabs && "bg-primary/10")}>
              <Menu className="h-[19px] w-[19px]" aria-hidden />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
