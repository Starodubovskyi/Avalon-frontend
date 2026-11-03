"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { Building2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, displayName } from "@/lib/auth/roles";
import { Avatar, btn } from "../ui/primitives";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { DETAIL_TITLE, findNav } from "./nav";
import { QuickSearch } from "./QuickSearch";
import { AisIndicator, BalanceChip, ThemeSwitch, UnpaidAlert } from "./TopbarWidgets";

/** Title and eyebrow from the menu (translated); pages outside the menu fall back to their own title */
function useHeading(fallback?: string): { title: string; eyebrow: string | null } {
  const t = useTranslations("nav");
  const pathname = usePathname() ?? "";
  const nav = findNav(pathname);
  if (!nav) return { title: fallback ?? "", eyebrow: null };
  const exact = pathname === nav.item.href;
  const detail = DETAIL_TITLE[nav.item.href];
  if (exact || !detail) return { title: t(`items.${nav.item.key}`), eyebrow: t(`groups.${nav.group.key}`) };
  return { title: t(`detail.${detail}`), eyebrow: t(`items.${nav.item.key}`) };
}

export function Topbar({ title, onMenu }: { title?: string; onMenu: () => void }) {
  const t = useTranslations("shell");
  const format = useFormatter();
  const { user } = useAuth();
  const staff = canEdit(user);
  const heading = useHeading(title);
  const today = format.dateTime(new Date(), { weekday: "long", day: "numeric", month: "long" });

  return (
    <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-3 shadow-[0_1px_0_hsl(var(--border)/0.6)] sm:gap-3 sm:px-6">
      <button type="button" onClick={onMenu} className={cn(btn.icon, "-ml-1 shrink-0 lg:hidden")} aria-label={t("openNavigation")}>
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <div className="min-w-0 flex-1 leading-tight md:flex-none md:shrink-0">
        <p className="hidden truncate text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:block">
          {heading.eyebrow ? (
            <>
              {heading.eyebrow}
              <span className="mx-1.5 text-border-strong">/</span>
            </>
          ) : null}
          <span className="normal-case tracking-normal">{today}</span>
        </p>
        <p className="truncate font-display text-[16px] font-bold tracking-[-0.015em] md:text-[17px]">{heading.title}</p>
      </div>
      <div className="hidden flex-1 justify-center px-2 md:flex">
        <QuickSearch />
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        {staff ? <UnpaidAlert /> : null}
        {staff ? <AisIndicator /> : null}
        {!staff && user ? (
          <Link
            href="/companies?tab=mine"
            className="focus-ring hidden h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground xl:flex"
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden /> {t("myCompanies")}
          </Link>
        ) : null}
        <BalanceChip />
        <span aria-hidden className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <LanguageSwitcher />
        <ThemeSwitch className="hidden sm:inline-flex" />
        <Link
          href="/account"
          className="ml-0.5 hidden rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background transition hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-primary/50 sm:block"
          aria-label={t("account")}
        >
          <Avatar name={displayName(user) || "User"} className="h-8 w-8 text-[11px]" />
        </Link>
      </div>
    </header>
  );
}
