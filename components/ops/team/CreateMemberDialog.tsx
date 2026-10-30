"use client";

import { useState, type FormEvent } from "react";
import { Mail, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamApi } from "@/lib/api/team";
import { extractAuthError } from "@/lib/api/auth";
import { ROLE, ROLE_LABEL } from "@/lib/auth/roles";
import { btn, Field, Spinner, TextInput } from "../ui/primitives";
import { ROLE_HELP, ROLE_META, ROLE_OPTIONS } from "./teamMeta";

const EMPTY = { firstName: "", lastName: "", email: "", password: "", roleId: ROLE.staff as number };
const PW_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generatePassword(length = 12): string {
  const bytes = new Uint32Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => PW_ALPHABET[b % PW_ALPHABET.length]).join("");
}

export function CreateMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await TeamApi.create({ ...form, email: form.email.trim() });
      toast.success(`Account created for ${form.firstName}. Send them the email and password.`);
      setForm(EMPTY);
      onCreated();
      onOpenChange(false);
    } catch (err) {
      const msg = extractAuthError(err);
      setError(/emailAlreadyExists/.test(msg) ? "This email already has an account — change its role in the list instead." : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] w-[calc(100%-1.5rem)] max-w-lg gap-0 overflow-y-auto rounded-2xl bg-card p-0 shadow-elevated sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b px-6 pb-4 pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </span>
          <DialogHeader className="min-w-0 space-y-1 pr-6 text-left">
            <DialogTitle className="font-display text-lg font-bold">Add team member</DialogTitle>
            <DialogDescription>The person signs in with this email and password and can change the password in Account.</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name">
                <TextInput value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoComplete="off" required autoFocus />
              </Field>
              <Field label="Last name">
                <TextInput value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="off" required />
              </Field>
            </div>
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-9" autoComplete="off" required />
              </div>
            </Field>
            <div className="relative">
              <Field label="Temporary password" hint="At least 6 characters — share it privately">
                <TextInput
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  className="tabular pr-28 font-mono"
                  required
                />
              </Field>
              <button
                type="button"
                onClick={() => setForm({ ...form, password: generatePassword() })}
                className={cn(btn.ghost, "absolute right-1 top-[26px] h-8 px-2.5 text-xs")}
                title="Generate a strong password"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Generate
              </button>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-foreground/80">Role</legend>
              <div className="grid gap-2">
                {ROLE_OPTIONS.map((r) => {
                  const meta = ROLE_META[r];
                  const Icon = meta.icon;
                  const active = form.roleId === r;
                  return (
                    <label key={r} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="member-role"
                        value={r}
                        checked={active}
                        onChange={() => setForm({ ...form, roleId: r })}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex items-center gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/40",
                          "peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15",
                          active && "border-primary/60 bg-primary/[0.04] ring-1 ring-primary/30",
                        )}
                      >
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", meta.tint)}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{ROLE_LABEL[r]}</span>
                          <span className="block text-xs text-muted-foreground">{ROLE_HELP[r]}</span>
                        </span>
                        <span
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition",
                            active ? "border-primary bg-primary shadow-[inset_0_0_0_3px_hsl(var(--card))]" : "border-input",
                          )}
                          aria-hidden
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {error ? <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{error}</p> : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onOpenChange(false)} className={btn.secondary}>Cancel</button>
            <button type="submit" disabled={busy || !form.email || !form.firstName || !form.lastName} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <UserPlus className="h-4 w-4" />}
              Create account
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
