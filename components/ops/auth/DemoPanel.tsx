"use client";

import { useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoRole } from "@/lib/demo/mode";
import { DEMO_ROLES } from "@/lib/demo/session";
import { Spinner, btn } from "../ui/primitives";
import { FormAlert } from "./AuthFields";

/** Role picker + entry into the in-browser demo on the sign-in page */
export function DemoPanel({
  role,
  onRole,
  busy,
  starting = false,
  primary,
  error,
  onEnter,
}: {
  role: DemoRole;
  onRole: (role: DemoRole) => void;
  /** any sign-in or demo start in flight: the button is disabled */
  busy: boolean;
  /** this demo entry is starting: shows the spinner */
  starting?: boolean;
  /** NEXT_PUBLIC_DEMO_MODE=only: the demo is the only way in */
  primary: boolean;
  error?: string | null;
  onEnter: () => void;
}) {
  const t = useTranslations("auth");
  const current = DEMO_ROLES.find((r) => r.role === role) ?? DEMO_ROLES[0];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // radio group keyboard model: arrows move the selection and the focus
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = DEMO_ROLES.findIndex((r) => r.role === role);
    const next = (i + step + DEMO_ROLES.length) % DEMO_ROLES.length;
    onRole(DEMO_ROLES[next].role);
    refs.current[next]?.focus();
  }

  return (
    <section
      aria-labelledby="demo-title"
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        primary ? "mt-7 border-primary/25 bg-primary/[0.04]" : "border-dashed bg-muted/40",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--brand-navy))] text-white shadow-[0_6px_16px_-6px_hsl(var(--primary)/0.7)]">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 id="demo-title" className="text-sm font-bold">
            {t("demo.title")}
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t("demo.text")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label={t("demo.roleLabel")} onKeyDown={onKey}>
        {DEMO_ROLES.map((r, i) => {
          const checked = role === r.role;
          return (
            <button
              key={r.role}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onRole(r.role)}
              className={cn(
                "h-9 rounded-lg px-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                checked ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`demo.roles.${r.role}.label`)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onEnter}
        disabled={busy}
        className={cn(primary ? btn.primary : btn.secondary, "group mt-3 h-11 w-full justify-between px-4")}
      >
        <span className="flex min-w-0 items-center gap-2">
          {starting ? <Spinner className={cn("h-4 w-4 shrink-0", primary && "text-primary-foreground")} /> : null}
          <span className="whitespace-nowrap font-semibold">{t("demo.exploreAs", { role: t(`demo.roles.${current.role}.label`) })}</span>
          <span className="truncate font-normal opacity-70">· {t(`demo.roles.${current.role}.hint`)}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </button>

      {error ? (
        <div className="mt-3">
          <FormAlert>{error}</FormAlert>
        </div>
      ) : null}
    </section>
  );
}
