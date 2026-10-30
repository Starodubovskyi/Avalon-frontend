"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Anchor, Eye, EyeOff, FileText, History, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthApi, extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { Field, Spinner, TextInput } from "../ui/primitives";

type Mode = "signin" | "register";

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

const FEATURES = [
  { icon: Map, text: "Every vessel in work on one map — Sulina roads to the berth" },
  { icon: Anchor, text: "Prearrivals, MSW, PDA, payment: red until done, green after" },
  { icon: History, text: "Each change is signed: who, what and when" },
  { icon: FileText, text: "Vessel and port documents in one place for the team" },
];

export function LoginView() {
  const params = useSearchParams();
  const next = params?.get("next") ?? null;
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && !busy) enterApp(next);
  }, [loading, user, next, busy]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
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
      setError(friendly(extractAuthError(err)));
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-full flex-1 overflow-y-auto bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-sidebar px-12 py-12 text-sidebar-foreground lg:flex lg:flex-col">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,hsl(var(--primary)/0.35),transparent_55%),radial-gradient(ellipse_at_90%_90%,hsl(var(--st-roads)/0.18),transparent_50%)]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 opacity-[0.07] [background-image:repeating-linear-gradient(170deg,white_0_1px,transparent_1px_22px)]" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-lg">
            <Image src="/brand/avalon-logo.png" alt="" width={58} height={58} priority />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-wide text-white">AVALON SHIPPING SRL</p>
            <p className="text-xs uppercase tracking-[0.22em] text-sidebar-muted">Sulina · Danube · Black Sea</p>
          </div>
        </div>
        <div className="relative mt-auto max-w-lg">
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-4xl">
            Every vessel, every step — one shared board.
          </h1>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-sidebar-foreground">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-white" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-0.5 shadow">
              <Image src="/brand/avalon-logo.png" alt="" width={44} height={44} priority />
            </span>
            <div className="leading-tight">
              <p className="font-semibold">AVALON SHIPPING</p>
              <p className="text-xs text-muted-foreground">Operations portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create a viewer account"}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Use the account your administrator gave you."
              : "Owners and partners get read-only access to vessel status. Staff accounts are issued by the administrator."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-medium" role="tablist">
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
                  "rounded-md py-2 transition-colors",
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "signin" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            {mode === "register" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name">
                  <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
                </Field>
                <Field label="Last name">
                  <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required />
                </Field>
              </div>
            ) : null}
            <Field label="Email">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                required
              />
            </Field>
            <Field label="Password" hint={mode === "register" ? "At least 6 characters" : undefined}>
              <div className="relative">
                <TextInput
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error ? (
              <p role="alert" className="rounded-lg border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy || !email || !password || (mode === "register" && (!firstName || !lastName))}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Avalon Shipping SRL · ship agency services, Sulina channel
          </p>
        </div>
      </section>
    </div>
  );
}

function friendly(message: string): string {
  if (/email: notFound/i.test(message)) return "No account with this email.";
  if (/password: incorrectPassword/i.test(message)) return "Wrong password.";
  if (/email: emailAlreadyExists/i.test(message)) return "An account with this email already exists — sign in instead.";
  if (/password: .*(min|short)/i.test(message)) return "Password must be at least 6 characters.";
  if (/Network Error|timeout/i.test(message)) return "Server is not reachable. Check your connection and try again.";
  return message;
}
