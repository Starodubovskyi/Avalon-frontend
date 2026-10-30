"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamApi, type TeamMember } from "@/lib/api/team";
import { extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { ROLE, ROLE_LABEL } from "@/lib/auth/roles";
import { fmtDate } from "@/lib/vessels/format";
import { ErrorBlock, Field, LoadingBlock, PageHeader, Panel, SelectInput, Spinner, TextInput } from "../ui/primitives";

const ROLE_OPTIONS = [ROLE.staff, ROLE.admin, ROLE.viewer];
const ROLE_HELP: Record<number, string> = {
  [ROLE.admin]: "Everything, including team and deleting vessels",
  [ROLE.staff]: "Edits vessels, checklist, documents; sees the log",
  [ROLE.viewer]: "Read-only: status, dates and position, no contacts or payments",
};

function memberName(m: TeamMember) {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || `#${m.id}`;
}

function CreateMemberDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", roleId: ROLE.staff as number });
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
      setForm({ firstName: "", lastName: "", email: "", password: "", roleId: ROLE.staff });
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>The person signs in with this email and password and can change the password in Account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"><TextInput value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></Field>
            <Field label="Last name"><TextInput value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></Field>
          </div>
          <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
          <Field label="Temporary password" hint="At least 6 characters"><TextInput type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required /></Field>
          <Field label="Role" hint={ROLE_HELP[form.roleId]}>
            <SelectInput value={form.roleId} onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </SelectInput>
          </Field>
          {error ? <p role="alert" className="rounded-lg border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-lg border px-4 text-sm">Cancel</button>
            <button type="submit" disabled={busy || !form.email || !form.firstName || !form.lastName} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              Create account
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TeamView() {
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useSWR("team", () => TeamApi.list());
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function changeRole(m: TeamMember, roleId: number) {
    setBusyId(m.id);
    try {
      await TeamApi.setRole(m.id, roleId);
      await mutate();
      toast.success(`${memberName(m)} is now ${ROLE_LABEL[roleId]}. Applies at their next sign-in or within 15 min.`);
    } catch (e) {
      toast.error(extractAuthError(e));
    } finally {
      setBusyId(null);
    }
  }

  async function removeMember(m: TeamMember) {
    if (!window.confirm(`Delete the account of ${memberName(m)}? Their changes stay in the log.`)) return;
    setBusyId(m.id);
    try {
      await TeamApi.remove(m.id);
      await mutate();
      toast.success("Account deleted");
    } catch (e) {
      toast.error(extractAuthError(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Team"
        subtitle="Every employee has a personal login, so the log shows who changed what."
        actions={
          <button type="button" onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:brightness-110">
            <UserPlus className="h-4 w-4" /> Add member
          </button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLE_OPTIONS.map((r) => (
          <div key={r} className="rounded-xl border bg-card p-3 text-xs">
            <p className="text-sm font-semibold">{ROLE_LABEL[r]}</p>
            <p className="mt-1 text-muted-foreground">{ROLE_HELP[r]}</p>
          </div>
        ))}
      </div>
      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      <Panel bodyClassName="p-0">
        {isLoading && !data ? (
          <LoadingBlock />
        ) : (
          <ul className="divide-y">
            {(data ?? []).map((m) => {
              const self = String(m.id) === String(user?.id);
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{memberName(m)}{self ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email} · since {fmtDate(m.createdAt)}</p>
                  </div>
                  {busyId === m.id ? <Spinner className="h-4 w-4" /> : null}
                  <SelectInput
                    value={m.role?.id ?? ROLE.viewer}
                    disabled={self || busyId === m.id}
                    onChange={(e) => void changeRole(m, Number(e.target.value))}
                    className="h-9 w-32"
                    aria-label={`Role of ${memberName(m)}`}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                    ))}
                  </SelectInput>
                  <button
                    type="button"
                    disabled={self || busyId === m.id}
                    onClick={() => void removeMember(m)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-bad/10 hover:text-bad disabled:opacity-30"
                    aria-label={`Delete ${memberName(m)}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <CreateMemberDialog open={open} onOpenChange={setOpen} onCreated={() => void mutate()} />
    </div>
  );
}
