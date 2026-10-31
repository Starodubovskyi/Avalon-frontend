"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { AuthApi } from "@/lib/api/auth";
import { ROLE_LABEL, displayName, roleId } from "@/lib/auth/roles";
import { useChatUnread } from "@/lib/network/hooks";
import { Avatar } from "../ui/primitives";
import { NAV_GROUPS, isActive } from "./nav";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-[0_0_0_4px_rgba(255,255,255,0.08),0_8px_24px_-6px_rgba(43,93,176,0.8)]">
        <Image src="/brand/avalon-logo.png" alt="Avalon Shipping SRL" width={40} height={40} priority />
      </span>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block font-display text-[15px] font-bold tracking-wide text-white">AVALON</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-sidebar-muted">Shipping · Ops</span>
        </span>
      )}
    </div>
  );
}

export function OpsSidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const role = roleId(user);
  const name = displayName(user);
  const { data: unread } = useChatUnread();
  const chatUnread = unread?.total ?? 0;
  const navRef = useRef<HTMLElement>(null);

  // Long menus scroll: keep the current section in view after navigation
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  return (
    <aside className={cn("bg-sidebar-gradient relative flex w-[264px] shrink-0 flex-col text-sidebar-foreground", className)}>
      <div className="px-5 pb-5 pt-5">
        <Link href="/dashboard" onClick={onNavigate} aria-label="Avalon Shipping — overview">
          <BrandMark />
        </Link>
      </div>

      <nav ref={navRef} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-3 pb-2" aria-label="Main">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => item.visible(user));
          if (!items.length) return null;
          return (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-muted/80">{group.label}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium transition-all",
                          active
                            ? "bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                            : "text-sidebar-muted hover:bg-white/[0.05] hover:text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                            active ? "bg-primary text-white shadow-[0_6px_14px_-4px_hsl(var(--primary)/0.9)]" : "bg-white/[0.04] group-hover:bg-white/[0.08]",
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge === "chat" && chatUnread > 0 ? (
                          <span className="tabular inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bad px-1.5 text-[11px] font-bold leading-none text-white shadow-[0_4px_10px_-4px_hsl(var(--bad))]">
                            {chatUnread > 99 ? "99+" : chatUnread}
                            <span className="sr-only"> unread messages</span>
                          </span>
                        ) : null}
                        {active ? <ChevronRight className="h-4 w-4 text-white/50" aria-hidden /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="m-3 flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-1.5">
        <Link href="/account" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.06]">
          <Avatar name={name || "User"} className="bg-white/10 text-white" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">{name}</span>
            <span className="block text-[11px] text-sidebar-muted">{role ? ROLE_LABEL[role] ?? "User" : ""}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => {
            void AuthApi.logout().finally(() => window.location.assign("/auth"));
          }}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sidebar-muted transition hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
