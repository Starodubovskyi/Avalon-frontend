"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Mail, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthApi, extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { demoEnvMode, setDemoFlag, type DemoRole } from "@/lib/demo/mode";
import { enterDemo, isServerUnavailable } from "@/lib/demo/session";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { Spinner, btn } from "../ui/primitives";
import { AuthInput, FormAlert, PasswordInput } from "./AuthFields";
import { AuthBrandPanel, AuthMobileHero } from "./AuthBrandPanel";
import { DemoPanel } from "./DemoPanel";

type Mode = "signin" | "register";

const DEMO_MODE = demoEnvMode();

const HOME = "/maps";

/** Same-origin path only: `/\evil.com`, `/%09/evil.com` and friends resolve to another origin and are rejected */
function safeNext(raw: string | null): string {
  if (!raw || typeof window === "undefined") return HOME;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname.startsWith("/auth")) return HOME;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return HOME;
  }
}

/** Full navigation so the SWR cache of a previous user on a shared PC is dropped */
function enterApp(raw: string | null) {
  window.location.assign(safeNext(raw));
}

/** Backend validation codes → dictionary keys; anything unknown is shown as the server sent it */
function errorKey(message: string): string | null {
  if (/email: notFound/i.test(message)) return "errors.notFound";
  if (/password: incorrectPassword/i.test(message)) return "errors.wrongPassword";
  if (/email: emailAlreadyExists/i.test(message)) return "errors.exists";
  if (/password: .*(min|short)/i.test(message)) return "errors.short";
  if (/Network Error|timeout/i.test(message)) return "errors.network";
  return null;
}

export function LoginView() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const next = params?.get("next") ?? null;
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // which action is in flight: the other one is disabled but shows no spinner
  const [pending, setPending] = useState<"signin" | "demo" | null>(null);
  const busy = pending !== null;
  // kept as a key, so a language switch after a failed attempt re-renders the message in the new language
  /** message key under auth.*; the raw server text is never shown */
  const [error, setError] = useState<string | null>(null);
  const [demoRole, setDemoRole] = useState<DemoRole>("admin");
  const [serverDown, setServerDown] = useState(false);
  const [demoError, setDemoError] = useState(false);

  useEffect(() => {
    if (!loading && user && !busy) enterApp(next);
  }, [loading, user, next, busy]);

  async function openDemo() {
    setDemoError(false);
    setPending("demo");
    try {
      await enterDemo(demoRole);
      window.location.assign("/dashboard");
    } catch {
      // shown under the demo entry: with NEXT_PUBLIC_DEMO_MODE=only the sign-in form is hidden
      setDemoError(true);
      setPending(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setServerDown(false);
    setPending("signin");
    // a real sign-in always talks to the real server
    if (DEMO_MODE !== "only") setDemoFlag(false);
    try {
      if (mode === "signin") {
        await AuthApi.login({ email: email.trim(), password });
      } else {
        await AuthApi.register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      }
      enterApp(next);
    } catch (err) {
      setError(errorKey(extractAuthError(err)) ?? "errors.generic");
      setServerDown(DEMO_MODE === "fallback" && isServerUnavailable(err));
      setPending(null);
    }
  }

  const copyKey = DEMO_MODE === "only" ? "demo" : mode;
  const canSubmit = !!email && !!password && (mode === "signin" || (!!firstName && !!lastName));

  return (
    <div className="grid min-h-full flex-1 grid-cols-1 overflow-y-auto overflow-x-hidden bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
      <AuthBrandPanel />

      <section className="relative flex min-h-full min-w-0 flex-col lg:px-10 xl:px-14">
        <AuthMobileHero />

        <header className="hidden items-center justify-between pt-7 lg:flex">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> {t("backToSite")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="segmented" />
            <PublicThemeToggle />
          </div>
        </header>

        <div className="relative z-10 -mt-12 flex flex-1 items-start justify-center px-3 pb-8 sm:px-6 lg:mt-0 lg:items-center lg:px-0 lg:py-10">
          <div className="hero-rise relative w-full max-w-[460px] rounded-[28px] border bg-card p-6 shadow-elevated sm:p-9">
            <span aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <h2 className="text-balance font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[32px]">{t(`copy.${copyKey}.title`)}</h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{t(`copy.${copyKey}.subtitle`)}</p>

            {DEMO_MODE === "only" ? null : (
              <>
                <div className="mt-7 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold" role="tablist" aria-label={t("tabsLabel")}>
                  {(["signin", "register"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => {
                        setMode(m);
                        setError(null);
                      }}
                      className={cn(
                        "h-10 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        mode === m ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m === "signin" ? t("signIn") : t("register")}
                    </button>
                  ))}
                </div>

                <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                  {mode === "register" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AuthInput
                        label={t("firstName")}
                        icon={UserRound}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        required
                      />
                      <AuthInput
                        label={t("lastName")}
                        icon={UserRound}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  ) : null}
                  <AuthInput
                    label={t("email")}
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    placeholder={t("emailPlaceholder")}
                    invalid={!!error}
                    required
                  />
                  <PasswordInput
                    label={t("password")}
                    hint={mode === "register" ? t("passwordHint") : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    invalid={!!error}
                    required
                  />

                  {error ? <FormAlert>{t(error)}</FormAlert> : null}
                  {serverDown ? (
                    <button
                      type="button"
                      onClick={() => void openDemo()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden /> {t("serverDown")}
                    </button>
                  ) : null}

                  <button type="submit" disabled={busy || !canSubmit} className={cn(btn.primary, "group h-12 w-full text-[15px]")}>
                    {pending === "signin" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
                    {mode === "signin" ? t("signIn") : t("createAccount")}
                    {pending === "signin" ? null : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />}
                  </button>
                </form>
              </>
            )}

            {DEMO_MODE !== "off" ? (
              <>
                {DEMO_MODE === "only" ? null : (
                  <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="h-px flex-1 bg-border" aria-hidden />
                    {t("or")}
                    <span className="h-px flex-1 bg-border" aria-hidden />
                  </div>
                )}
                <DemoPanel
                  role={demoRole}
                  onRole={setDemoRole}
                  busy={busy}
                  starting={pending === "demo"}
                  primary={DEMO_MODE === "only"}
                  error={demoError ? t("errors.demo") : null}
                  onEnter={() => void openDemo()}
                />
              </>
            ) : null}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-6 text-xs text-muted-foreground lg:pb-8">
          {/* static on purpose: a clock read during render would differ between server and client at the year boundary */}
          <span>{t("footer")}</span>
          <Link href="/port-guide" className="hover:text-foreground">
            {t("portGuide")}
          </Link>
          <Link href="/request" className="hover:text-foreground">
            {t("requestAgency")}
          </Link>
        </footer>
      </section>
    </div>
  );
}
