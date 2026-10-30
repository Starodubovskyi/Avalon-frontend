"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AccountApi } from "@/lib/api/team";
import { AuthApi, extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { ROLE_LABEL, roleId } from "@/lib/auth/roles";
import { Field, PageHeader, Panel, Spinner, TextInput } from "../ui/primitives";

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

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Account" subtitle={`${user?.email ?? ""} · ${role ? ROLE_LABEL[role] ?? "User" : ""}`} />
      <Panel title="Profile">
        <form onSubmit={saveProfile} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name"><TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
            <Field label="Last name"><TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
          </div>
          <p className="text-xs text-muted-foreground">Your name is shown next to every change you make.</p>
          <button type="submit" disabled={busy !== null} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {busy === "profile" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null} Save
          </button>
        </form>
      </Panel>
      <Panel title="Password">
        <form onSubmit={savePassword} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Current password"><TextInput type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoComplete="current-password" /></Field>
            <Field label="New password" hint="At least 6 characters"><TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
          </div>
          <button type="submit" disabled={busy !== null || !oldPassword || !password} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {busy === "password" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null} Change password
          </button>
        </form>
      </Panel>
      <button
        type="button"
        onClick={() => void AuthApi.logout().finally(() => window.location.assign("/auth"))}
        className="h-10 rounded-lg border px-4 text-sm font-medium text-bad hover:bg-bad/5"
      >
        Sign out
      </button>
    </div>
  );
}
