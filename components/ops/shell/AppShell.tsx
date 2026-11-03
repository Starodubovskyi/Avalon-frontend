"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, isAdmin } from "@/lib/auth/roles";
import { BrandSeal } from "@/components/public/brand/BrandSeal";
import { DemoBanner } from "./DemoBanner";
import { MobileTabBar } from "./MobileTabBar";
import { OpsSidebar } from "./OpsSidebar";
import { Topbar } from "./Topbar";
import { ThemeSwitch } from "./TopbarWidgets";
import { LoadingBlock } from "../ui/primitives";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

type Access = "any" | "staff" | "admin";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  /** full-bleed content (map) without page padding/scroll */
  fill?: boolean;
  access?: Access;
}

/** Language and theme in the phone drawer, where the top bar has no room for both */
function DrawerPreferences() {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1.5">
      <LanguageSwitcher variant="segmented" tone="inverted" />
      <ThemeSwitch className="text-sidebar-muted hover:bg-white/10 hover:text-white" />
    </div>
  );
}

function SessionScreen() {
  const t = useTranslations("shell");
  return (
    <div className="app-canvas flex flex-1 flex-col items-center justify-center gap-4">
      <span className="relative flex items-center justify-center">
        <span aria-hidden className="absolute h-20 w-20 animate-ping rounded-full bg-primary/10 [animation-duration:2s]" />
        <BrandSeal size="lg" label="Avalon Shipping" priority className="relative" />
      </span>
      <LoadingBlock label={t("checkingSession")} />
    </div>
  );
}

export function AppShell({ children, title, fill = false, access = "any" }: AppShellProps) {
  const t = useTranslations("shell");
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (!user) return <SessionScreen />;

  const allowed =
    access === "any" || (access === "staff" && canEdit(user)) || (access === "admin" && isAdmin(user));

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <OpsSidebar className="hidden lg:flex" />

      <div
        className={cn(
          "fixed inset-0 z-50 transition-[visibility] lg:hidden",
          menuOpen ? "visible" : "invisible delay-200",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn("absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200", menuOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex transition-transform duration-300 ease-out-expo",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <OpsSidebar onNavigate={() => setMenuOpen(false)} footer={<DrawerPreferences />} className="pb-[env(safe-area-inset-bottom)] shadow-elevated" />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="m-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label={t("closeNavigation")}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner />
        <Topbar title={title} onMenu={() => setMenuOpen(true)} />
        <main
          className={cn(
            "app-canvas min-h-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0",
            fill ? "relative flex flex-col overflow-hidden" : "overflow-y-auto overflow-x-hidden",
          )}
        >
          {!allowed ? (
            <div className="mx-auto mt-12 max-w-lg px-4">
              <div className="rounded-3xl border bg-card p-10 text-center shadow-raised">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Lock className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 font-display text-lg font-bold">{t("noAccessTitle")}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("noAccessText")}</p>
              </div>
            </div>
          ) : fill ? (
            children
          ) : (
            <div key={pathname} className="animate-in-up mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-8 sm:py-8">
              {children}
            </div>
          )}
        </main>
        <MobileTabBar onMenu={() => setMenuOpen(true)} />
      </div>
    </div>
  );
}
