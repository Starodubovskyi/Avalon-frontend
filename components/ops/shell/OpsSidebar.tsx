"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { AuthApi } from "@/lib/api/auth";
import { displayName } from "@/lib/auth/roles";
import { useChatUnread } from "@/lib/network/hooks";
import { useNewRequestsCount } from "@/lib/requests/hooks";
import { BrandSeal } from "@/components/public/brand/BrandSeal";
import { Avatar } from "../ui/primitives";
import { NAV_GROUPS, isActive, type NavItem } from "./nav";
import { roleKeyOf } from "./roleKey";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandSeal size="md" label="Avalon Shipping SRL" priority glow className="h-11 w-11" />
      {compact ? null : (
        <span className="leading-tight">
          <span className="block font-display text-[15px] font-extrabold tracking-[0.12em] text-white">AVALON</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.26em] text-sidebar-muted">Shipping · Ops</span>
        </span>
      )}
    </div>
  );
}

function CountBadge({ value, tone, srLabel }: { value: number; tone: "bad" | "expected"; srLabel: string }) {
  return (
    <span
      className={cn(
        "tabular inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none text-white",
        tone === "bad" ? "bg-bad shadow-[0_4px_10px_-4px_hsl(var(--bad))]" : "bg-stage-expected shadow-[0_4px_10px_-4px_hsl(var(--st-expected))]",
      )}
    >
      {value > 99 ? "99+" : value}
      <span className="sr-only"> {srLabel}</span>
    </span>
  );
}

function NavLink({ item, active, onNavigate, badge }: { item: NavItem; active: boolean; onNavigate?: () => void; badge: React.ReactNode }) {
  const t = useTranslations("nav");
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-xl px-2.5 text-[13.5px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        active
          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.05)]"
          : "text-sidebar-muted hover:bg-white/[0.045] hover:text-white",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[hsl(var(--brand-accent))] to-primary shadow-[0_0_12px_hsl(var(--brand-accent)/0.6)]"
        />
      ) : null}
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-gradient-to-b from-primary to-primary-strong text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_14px_-4px_hsl(var(--primary)/0.8)]"
            : "bg-white/[0.04] text-sidebar-muted group-hover:bg-white/[0.08] group-hover:text-white",
        )}
      >
        <Icon className="h-[15px] w-[15px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate">{t(`items.${item.key}`)}</span>
      {badge}
    </Link>
  );
}

export function OpsSidebar({
  className,
  onNavigate,
  footer,
}: {
  className?: string;
  onNavigate?: () => void;
  /** extra row above the user block (the phone drawer puts language and theme there) */
  footer?: React.ReactNode;
}) {
  const t = useTranslations("nav");
  const ts = useTranslations("shell");
  const tc = useTranslations("common");
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const roleKey = roleKeyOf(user);
  const name = displayName(user);
  const { data: unread } = useChatUnread();
  const chatUnread = unread?.total ?? 0;
  const newRequests = useNewRequestsCount();
  const navRef = useRef<HTMLElement>(null);

  // Long menus scroll: keep the current section in view after navigation
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  return (
    <aside className={cn("bg-sidebar-gradient sidebar-edge relative flex w-[264px] shrink-0 flex-col text-sidebar-foreground", className)}>
      <div aria-hidden className="noise-overlay opacity-[0.04]" />
      <div className="relative px-5 pb-4 pt-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label={ts("brandHome")}
          className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-4 focus-visible:ring-offset-sidebar"
        >
          <BrandMark />
        </Link>
      </div>
      <div aria-hidden className="relative mx-5 mb-3 h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

      <nav
        ref={navRef}
        className="no-scrollbar relative flex-1 space-y-5 overflow-y-auto px-3 pb-3 pt-1 [mask-image:linear-gradient(to_bottom,transparent,#000_14px,#000_calc(100%-18px),transparent)]"
        aria-label={t("aria")}
      >
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => item.visible(user));
          if (!items.length) return null;
          return (
            <div key={group.key}>
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-muted/70">{t(`groups.${group.key}`)}</p>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      active={isActive(pathname, item.href)}
                      onNavigate={onNavigate}
                      badge={
                        item.badge === "chat" && chatUnread > 0 ? (
                          <CountBadge value={chatUnread} tone="bad" srLabel={ts("unreadMessages")} />
                        ) : item.badge === "requests" && newRequests > 0 ? (
                          <CountBadge value={newRequests} tone="expected" srLabel={ts("newRequests")} />
                        ) : null
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {footer ? <div className="relative mx-3 mt-1">{footer}</div> : null}
      <div className="relative m-3 flex items-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <Link
          href="/account"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="relative">
            <Avatar name={name || tc("role.user")} className="bg-white/10 text-white ring-white/10" />
            <span aria-hidden className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-ok" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">{name}</span>
            <span className="block text-[11px] text-sidebar-muted">{tc(`role.${roleKey}`)}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => {
            void AuthApi.logout().finally(() => window.location.assign("/auth"));
          }}
          title={ts("signOut")}
          aria-label={ts("signOut")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sidebar-muted transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
