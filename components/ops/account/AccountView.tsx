"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { KeyRound, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AccountApi } from "@/lib/api/team";
import { AuthApi, extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { displayName, roleId } from "@/lib/auth/roles";
import { Avatar, btn, Field, PageHeader, Panel, Spinner, TextInput } from "../ui/primitives";
import { ROLE_HELP, RoleBadge } from "../team/teamMeta";

export function AccountView() {
  const { user, refresh } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"profile" | "password" | null>(null);

  // Fill once per account; background /auth/me refreshes must not reset what is being typed
  const filledFor = useRef<string | number | null>(null);
  useEffect(() => {
    if (!user || filledFor.current === user.id) return;
    filledFor.current = user.id;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
  }, [user]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy("profile");
    try {
      await AccountApi.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      await refresh();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(extractAuthError(err));
    } finally {
      setBusy(null);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setBusy("password");
    try {
      await AccountApi.update({ password, oldPassword });
      setOldPassword("");
      setPassword("");
      toast.success("Password changed");
    } catch (err) {
      const msg = extractAuthError(err);
      toast.error(/incorrectOldPassword|oldPassword/.test(msg) ? "Current password is wrong" : msg);
    } finally {
      setBusy(null);
    }
  }

  const role = roleId(user);
  const name = displayName(user);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader eyebrow="Account" title="Your profile" subtitle="How you appear in the activity log, and how you sign in." />

      <section className="relative overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden />
        <div className="relative flex flex-wrap items-end gap-4 px-5 pb-5 pt-10 sm:px-6">
          <Avatar name={name || "User"} className="h-20 w-20 text-2xl ring-4 ring-card shadow-elevated" />
          <div className="min-w-0 flex-1 basis-48">
            <h2 className="truncate font-display text-xl font-bold">{name || "—"}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
              {role ? <RoleBadge roleId={role} /> : null}
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{user?.email ?? "—"}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void AuthApi.logout().finally(() => window.location.assign("/auth"))}
            className={btn.danger}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
        {role && ROLE_HELP[role] ? (
          <p className="flex items-start gap-2 border-t bg-muted/40 px-5 py-3 text-xs text-muted-foreground sm:px-6">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Your access: {ROLE_HELP[role]}. Ask an administrator to change your role.</span>
          </p>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Profile" description="Shown next to every change you make" icon={<UserRound className="h-4 w-4" />} className="flex flex-col" bodyClassName="flex-1">
          <form onSubmit={saveProfile} className="flex h-full flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name">
                <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
              </Field>
            </div>
            <Field label="Email" hint="Email is your login and cannot be changed here">
              <TextInput value={user?.email ?? ""} readOnly disabled />
            </Field>
            <div className="mt-auto flex justify-end pt-1">
              <button type="submit" disabled={busy !== null} className={btn.primary}>
                {busy === "profile" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null} Save profile
              </button>
            </div>
          </form>
        </Panel>

        <Panel title="Password" description="Use at least 6 characters" icon={<KeyRound className="h-4 w-4" />} className="flex flex-col" bodyClassName="flex-1">
          <form onSubmit={savePassword} className="flex h-full flex-col gap-4">
            <Field label="Current password">
              <TextInput type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoComplete="current-password" />
            </Field>
            <Field label="New password" hint="At least 6 characters">
              <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </Field>
            <div className="mt-auto flex justify-end pt-1">
              <button type="submit" disabled={busy !== null || !oldPassword || !password} className={btn.primary}>
                {busy === "password" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null} Change password
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
