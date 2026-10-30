"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { AuthApi } from "@/lib/api/auth";
import { ROLE_LABEL, displayName, initials, roleId } from "@/lib/auth/roles";
import { NAV_ITEMS, isActive } from "./nav";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
        <Image src="/brand/avalon-logo.png" alt="Avalon Shipping SRL" width={36} height={36} priority />
      </span>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-wide text-white">AVALON SHIPPING</span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-sidebar-muted">Operations</span>
        </span>
      )}
    </div>
  );
}

export function OpsSidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const role = roleId(user);

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="px-5 pb-6 pt-5">
        <Link href="/maps" onClick={onNavigate} aria-label="Avalon Shipping — fleet map">
          <BrandMark />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Main">
        {NAV_ITEMS.filter((item) => item.visible(user)).map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-white shadow-[inset_3px_0_0_hsl(var(--primary))]"
                  : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-white",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-primary" : "")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <Link
          href="/account"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent/60"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-white">
            {initials(user)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm text-white">{displayName(user)}</span>
            <span className="block text-[11px] text-sidebar-muted">
              {role ? ROLE_LABEL[role] ?? "User" : ""}
            </span>
          </span>
          <UserRound className="h-4 w-4 text-sidebar-muted" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => {
            void AuthApi.logout().finally(() => window.location.assign("/auth"));
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </button>
      </div>
    </aside>
  );
}
