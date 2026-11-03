"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Globe, Loader2, LogOut, Monitor, Palette, ShieldCheck, UserRound, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { displayName } from "@/lib/auth/roles";
import { LOCALES, LOCALE_LABEL } from "@/i18n/config";
import { useAppLocale } from "@/lib/i18n/useAppLocale";
import { Avatar, PageHeader, btn } from "../ui/primitives";
import { roleKeyOf } from "../shell/roleKey";

function Section({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t py-7 first:border-t-0 first:pt-0 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold tracking-[-0.01em]">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

const CHOICE =
  "group relative flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-left shadow-card transition duration-150 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

function LanguageChoices() {
  const t = useTranslations("settings");
  const { locale, setLocale, pending } = useAppLocale();
  return (
    <div role="radiogroup" aria-label={t("language.title")} className="grid gap-2.5 sm:grid-cols-3">
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            lang={l}
            onClick={() => (active ? undefined : setLocale(l))}
            className={cn(CHOICE, active && "border-primary/50 bg-primary/[0.04] ring-1 ring-primary/30")}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-wide",
                active ? "bg-gradient-to-b from-primary to-primary-strong text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" : "bg-muted text-muted-foreground",
              )}
            >
              {LOCALE_LABEL[l].short}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{LOCALE_LABEL[l].name}</span>
              <span className="block truncate text-xs text-muted-foreground">{active ? t("language.current") : t(`language.native.${l}`)}</span>
            </span>
            {active ? (
              pending ? <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden /> : <Check className="h-4 w-4 text-primary" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function ThemePreview({ dark }: { dark: boolean }) {
  return (
    <span aria-hidden className={cn("flex h-16 w-full overflow-hidden rounded-xl border", dark ? "border-white/10 bg-[hsl(226_38%_6%)]" : "bg-[hsl(222_24%_97%)]")}>
      <span className={cn("w-1/4", dark ? "bg-[hsl(228_48%_4%)]" : "bg-[hsl(226_62%_12%)]")} />
      <span className="flex flex-1 flex-col gap-1.5 p-2">
        <span className={cn("h-2 w-1/2 rounded-full", dark ? "bg-white/20" : "bg-slate-300")} />
        <span className="flex gap-1.5">
          <span className={cn("h-6 flex-1 rounded-md", dark ? "bg-white/[0.06]" : "bg-white shadow-sm")} />
          <span className={cn("h-6 flex-1 rounded-md", dark ? "bg-white/[0.06]" : "bg-white shadow-sm")} />
        </span>
      </span>
    </span>
  );
}

function ThemeChoices() {
  const t = useTranslations("settings");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? resolvedTheme : null;
  return (
    <div role="radiogroup" aria-label={t("appearance.title")} className="grid max-w-xl grid-cols-2 gap-2.5">
      {(["light", "dark"] as const).map((mode) => {
        const active = current === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(mode)}
            className={cn(CHOICE, "flex-col items-stretch gap-2.5", active && "border-primary/50 ring-1 ring-primary/30")}
          >
            <ThemePreview dark={mode === "dark"} />
            <span className="flex items-center justify-between text-sm font-semibold">
              {t(`appearance.${mode}`)}
              {active ? <Check className="h-4 w-4 text-primary" aria-hidden /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LinkRow({ href, icon: Icon, title, text }: { href: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <Link href={href} className={cn(CHOICE, "hover:shadow-raised")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{text}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
    </Link>
  );
}

/** Real, stored preferences only: language (saved to the profile), theme, and the way to account and session */
export function SettingsView() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { user } = useAuth();
  const name = displayName(user);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="rounded-3xl border bg-card p-5 shadow-card sm:p-8">
        <Section icon={Globe} title={t("language.title")} text={t("language.text")}>
          <LanguageChoices />
          <p className="mt-3 text-xs text-muted-foreground">{t("language.saved")}</p>
        </Section>

        <Section icon={Palette} title={t("appearance.title")} text={t("appearance.text")}>
          <ThemeChoices />
        </Section>

        <Section icon={UserRound} title={t("account.title")} text={t("account.text")}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <LinkRow href="/account" icon={ShieldCheck} title={t("account.profile")} text={t("account.profileText")} />
            <LinkRow href="/balance" icon={Wallet} title={t("account.balance")} text={t("account.balanceText")} />
          </div>
        </Section>

        <Section icon={Monitor} title={t("session.title")} text={t("session.text")}>
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-3.5 sm:flex-row sm:items-center">
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={name || tc("role.user")} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {tc(`role.${roleKeyOf(user)}`)}
                  {user?.email ? ` · ${user.email}` : ""}
                </span>
              </span>
            </span>
            <button
              type="button"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void AuthApi.logout().finally(() => window.location.assign("/auth"));
              }}
              className={cn(btn.danger, "w-full sm:w-auto")}
            >
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
              {t("session.signOut")}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
