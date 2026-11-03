"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { btn } from "@/components/ops/ui/primitives";
import { LanguageSwitcher } from "@/components/ops/ui/LanguageSwitcher";
import { PublicThemeToggle } from "./PublicThemeToggle";
import { BrandLockup } from "./brand/BrandSeal";

/** Labels live in `publicPages.shell.nav.<key>` */
export const PUBLIC_NAV = [
  { href: "/#services", key: "services" },
  { href: "/port-guide", key: "portGuide" },
  { href: "/estimate", key: "estimate" },
  { href: "/request", key: "request" },
] as const;

export function PublicLogo({ inverted = false }: { inverted?: boolean }) {
  const t = useTranslations("publicPages");
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={t("shell.homeLabel")}
    >
      <BrandLockup inverted={inverted} tagline="Shipping SRL" priority={!inverted} />
    </Link>
  );
}

/** "Client login" for guests, "Open dashboard" once a session exists; a quiet placeholder while it resolves */
export function AccountCta({ className, block = false }: { className?: string; block?: boolean }) {
  const t = useTranslations("publicPages");
  const { user, loading } = useAuth();
  if (loading && !user) {
    return <span className={cn("h-10 w-[136px] animate-pulse rounded-xl bg-muted", block && "w-full", className)} aria-hidden />;
  }
  return user ? (
    <Link href="/dashboard" className={cn(btn.primary, block && "w-full", className)}>
      <LayoutDashboard className="h-4 w-4" aria-hidden /> {t("shell.openDashboard")}
    </Link>
  ) : (
    <Link href="/auth" className={cn(btn.primary, block && "w-full", className)}>
      <LogIn className="h-4 w-4" aria-hidden /> {t("shell.clientLogin")}
    </Link>
  );
}

function navActive(pathname: string, href: string): boolean {
  return !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
}

export function PublicHeader() {
  const t = useTranslations("publicPages");
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

        <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex" aria-label={t("shell.navMain")}>
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
                {t(`shell.nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <PublicThemeToggle />
          <AccountCta className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(btn.icon, "h-10 w-10 rounded-xl lg:hidden")}
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            aria-label={open ? t("shell.closeMenu") : t("shell.openMenu")}
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
        <nav className="mx-auto max-w-7xl px-4 pb-5 pt-2 sm:px-6" aria-label={t("shell.navMobile")}>
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
                  {t(`shell.nav.${item.key}`)}
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
