"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutGrid, Map, Menu, MessageCircle, Ship, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatUnread } from "@/lib/network/hooks";
import { isActive } from "./nav";

type TabKey = "overview" | "map" | "vessels" | "chat";

const TABS: { href: string; key: TabKey; icon: LucideIcon; badge?: boolean }[] = [
  { href: "/dashboard", key: "overview", icon: LayoutGrid },
  { href: "/maps", key: "map", icon: Map },
  { href: "/vessels", key: "vessels", icon: Ship },
  { href: "/chat", key: "chat", icon: MessageCircle, badge: true },
];

const TAB =
  "relative flex h-full w-full flex-col items-center justify-center gap-1 text-[10.5px] font-semibold tracking-[0.01em] transition-colors active:scale-95 focus-visible:outline-none";

function TabIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200",
        active ? "bg-gradient-to-b from-primary/15 to-primary/5 text-primary" : "group-focus-visible:ring-2 group-focus-visible:ring-ring/50",
      )}
    >
      <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.4 : 2} aria-hidden />
    </span>
  );
}

/** Phone navigation: the four sections people open most, plus the full menu */
export function MobileTabBar({ onMenu }: { onMenu: () => void }) {
  const t = useTranslations("nav");
  const ts = useTranslations("shell");
  const pathname = usePathname() ?? "";
  const { data: unread } = useChatUnread();
  const chatUnread = unread?.total ?? 0;
  const inTabs = TABS.some((tab) => isActive(pathname, tab.href));

  return (
    <nav
      aria-label={t("tabsAria")}
      className="glass fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-16px_hsl(var(--shadow-color)/0.35)] lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(TAB, "group", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                {active ? <span aria-hidden className="absolute top-0 h-[2px] w-8 rounded-b-full bg-primary" /> : null}
                <TabIcon icon={tab.icon} active={active} />
                <span className="max-w-full truncate px-0.5">{t(`tabs.${tab.key}`)}</span>
                {tab.badge && chatUnread > 0 ? (
                  <span className="tabular absolute right-[calc(50%-24px)] top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card">
                    {chatUnread > 99 ? "99+" : chatUnread}
                    <span className="sr-only"> {ts("unreadMessages")}</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onMenu} className={cn(TAB, "group", inTabs ? "text-muted-foreground hover:text-foreground" : "text-primary")}>
            {!inTabs ? <span aria-hidden className="absolute top-0 h-[2px] w-8 rounded-b-full bg-primary" /> : null}
            <TabIcon icon={Menu} active={!inTabs} />
            <span className="max-w-full truncate px-0.5">{t("tabs.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
