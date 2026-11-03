"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, LOCALE_LABEL, type AppLocale } from "@/i18n/config";
import { useAppLocale } from "@/lib/i18n/useAppLocale";

type Tone = "default" | "inverted";

/**
 * EN / RU / RO switcher. Switching writes the cookie and refreshes the server tree in place:
 * no page reload, client state (an unfinished sign-in form, for one) is kept.
 * `menu` is a compact trigger with a popover (top bars), `segmented` shows all three (auth, settings).
 */
export function LanguageSwitcher({
  variant = "menu",
  tone = "default",
  align = "right",
  className,
}: {
  variant?: "menu" | "segmented";
  tone?: Tone;
  align?: "left" | "right";
  className?: string;
}) {
  return variant === "segmented" ? (
    <SegmentedSwitcher tone={tone} className={className} />
  ) : (
    <MenuSwitcher tone={tone} align={align} className={className} />
  );
}

function SegmentedSwitcher({ tone, className }: { tone: Tone; className?: string }) {
  const t = useTranslations("common");
  const { locale, setLocale, pending } = useAppLocale();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const inverted = tone === "inverted";

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (LOCALES.indexOf(locale) + step + LOCALES.length) % LOCALES.length;
    setLocale(LOCALES[next]);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={t("language")}
      aria-busy={pending || undefined}
      onKeyDown={onKey}
      className={cn(
        "relative inline-grid grid-cols-3 rounded-xl p-0.5 text-xs font-semibold",
        inverted ? "bg-white/[0.08] ring-1 ring-inset ring-white/10" : "bg-muted ring-1 ring-inset ring-border",
        pending && "opacity-80",
        className,
      )}
    >
      {LOCALES.map((l, i) => {
        const checked = l === locale;
        return (
          <button
            key={l}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            title={LOCALE_LABEL[l].name}
            lang={l}
            onClick={() => (checked ? undefined : setLocale(l))}
            className={cn(
              "h-8 min-w-[42px] rounded-[10px] px-2.5 tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
              inverted ? "focus-visible:ring-white/50" : "focus-visible:ring-ring/60",
              checked
                ? inverted
                  ? "bg-white text-[hsl(var(--brand-deep))] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]"
                  : "bg-card text-foreground shadow-card"
                : inverted
                  ? "text-white/65 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LOCALE_LABEL[l].short}
          </button>
        );
      })}
    </div>
  );
}

function MenuSwitcher({ tone, align, className }: { tone: Tone; align: "left" | "right"; className?: string }) {
  const t = useTranslations("common");
  const { locale, setLocale, pending } = useAppLocale();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const inverted = tone === "inverted";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    itemRefs.current[LOCALES.indexOf(locale)]?.focus();
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, locale]);

  function choose(next: AppLocale) {
    setOpen(false);
    if (next !== locale) setLocale(next);
  }

  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const next = (current + step + LOCALES.length) % LOCALES.length;
    itemRefs.current[next]?.focus();
  }

  return (
    <div ref={boxRef} className={cn("relative", className)} onKeyDown={onMenuKey}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t("language")}: ${LOCALE_LABEL[locale].name}`}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2",
          inverted
            ? "text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-white/50"
            : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/60",
          open && (inverted ? "bg-white/10 text-white" : "bg-muted text-foreground"),
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Globe className="h-4 w-4" aria-hidden />}
        <span>{LOCALE_LABEL[locale].short}</span>
        <ChevronDown className={cn("h-3 w-3 opacity-60 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t("language")}
          className={cn(
            "animate-pop absolute top-11 z-50 w-48 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-elevated",
            align === "right" ? "right-0" : "left-0 origin-top-left",
          )}
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-muted-foreground">{t("language")}</p>
          {LOCALES.map((l, i) => {
            const active = l === locale;
            return (
              <button
                key={l}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                lang={l}
                onClick={() => choose(l)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors focus-visible:bg-muted",
                  active ? "font-semibold text-foreground" : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-8 items-center justify-center rounded-md text-[10px] font-bold tracking-wide",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {LOCALE_LABEL[l].short}
                </span>
                <span className="flex-1">{LOCALE_LABEL[l].name}</span>
                {active ? <Check className="h-4 w-4 text-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
