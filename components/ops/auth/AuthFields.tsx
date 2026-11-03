"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const inputBase =
  "peer h-12 w-full rounded-xl border border-input bg-card pl-11 text-[15px] text-foreground shadow-[0_1px_2px_hsl(var(--shadow-color)/0.05)] transition placeholder:text-muted-foreground/70 hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 aria-[invalid=true]:border-bad/70 aria-[invalid=true]:focus-visible:ring-bad/15";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

function FieldShell({ id, label, hint, hintId, children }: { id: string; label: string; hint?: string; hintId: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-semibold text-foreground/85">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Text input with a leading icon that lights up on focus */
export function AuthInput({ label, icon: Icon, hint, invalid, ...props }: InputProps & { label: string; icon: LucideIcon; hint?: string; invalid?: boolean }) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <FieldShell id={id} label={label} hint={hint} hintId={hintId}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? hintId : undefined}
          className={cn(inputBase, "pr-3.5")}
          {...props}
        />
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors peer-focus-visible:text-primary"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

/** Password input with a show / hide toggle */
export function PasswordInput({ label, hint, invalid, ...props }: InputProps & { label: string; hint?: string; invalid?: boolean }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell id={id} label={label} hint={hint} hintId={hintId}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? hintId : undefined}
          className={cn(inputBase, "pr-12")}
          {...props}
        />
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors peer-focus-visible:text-primary"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
        </button>
      </div>
    </FieldShell>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-bad/25 bg-bad/[0.06] px-3.5 py-3 text-sm text-bad">
      <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
      <span className="leading-snug">{children}</span>
    </div>
  );
}
