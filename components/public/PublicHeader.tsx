"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { btn } from "@/components/ops/ui/primitives";
import { PublicThemeToggle } from "./PublicThemeToggle";

export const PUBLIC_NAV = [
  { href: "/#services", label: "Services" },
  { href: "/port-guide", label: "Port guide" },
  { href: "/estimate", label: "PDA estimate" },
  { href: "/request", label: "Request agency" },
] as const;

export function PublicLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Avalon Shipping — home">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-0.5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_6px_18px_-6px_hsl(var(--primary)/0.7)]">
        <Image src="/brand/avalon-logo.png" alt="" width={36} height={36} priority />
      </span>
      <span className="leading-tight">
        <span className={cn("block font-display text-[15px] font-extrabold tracking-wide", inverted ? "text-white" : "text-foreground")}>
          AVALON
        </span>
        <span className={cn("block text-[10px] font-semibold uppercase tracking-[0.22em]", inverted ? "text-white/60" : "text-muted-foreground")}>
          Shipping SRL
        </span>
      </span>
    </Link>
  );
}

/** "Client login" for guests, "Open dashboard" once a session exists; a quiet placeholder while it resolves */
export function AccountCta({ className, block = false }: { className?: string; block?: boolean }) {
  const { user, loading } = useAuth();
  if (loading && !user) {
    return <span className={cn("h-10 w-[136px] animate-pulse rounded-xl bg-muted", block && "w-full", className)} aria-hidden />;
  }
  return user ? (
    <Link href="/dashboard" className={cn(btn.primary, block && "w-full", className)}>
      <LayoutDashboard className="h-4 w-4" aria-hidden /> Open dashboard
    </Link>
  ) : (
    <Link href="/auth" className={cn(btn.primary, block && "w-full", className)}>
      <LogIn className="h-4 w-4" aria-hidden /> Client login
    </Link>
  );
}

function navActive(pathname: string, href: string): boolean {
  return !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
}

export function PublicHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <PublicLogo />

        <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
          {PUBLIC_NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <PublicThemeToggle />
          <AccountCta className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(btn.icon, "h-10 w-10 rounded-xl lg:hidden")}
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-30 bg-slate-950/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        id="public-mobile-menu"
        className={cn(
          "absolute inset-x-0 top-full z-40 origin-top border-b bg-card shadow-elevated transition duration-200 lg:hidden",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 pb-5 pt-2 sm:px-6" aria-label="Mobile">
          <ul className="divide-y">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={navActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-[48px] items-center justify-between py-3 text-[15px] font-semibold",
                    navActive(pathname, item.href) ? "text-primary" : "text-foreground",
                  )}
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <AccountCta block className="mt-4 h-12" />
        </nav>
      </div>
    </header>
  );
}
