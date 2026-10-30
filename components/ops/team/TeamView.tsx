"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { CalendarDays, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TeamApi, type TeamMember } from "@/lib/api/team";
import { extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { ROLE, ROLE_LABEL } from "@/lib/auth/roles";
import { fmtDate } from "@/lib/vessels/format";
import { Avatar, btn, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, SelectInput, Spinner } from "../ui/primitives";
import { CreateMemberDialog } from "./CreateMemberDialog";
import { memberName, ROLE_HELP, ROLE_META, ROLE_OPTIONS, RoleBadge } from "./teamMeta";

export function TeamView() {
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useSWR("team", () => TeamApi.list());
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<number, number> = {};
    for (const m of data ?? []) {
      const r = m.role?.id ?? ROLE.viewer;
      c[r] = (c[r] ?? 0) + 1;
    }
    return c;
  }, [data]);

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

  const members = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Team"
        subtitle="Every employee has a personal login, so the log shows who changed what."
        actions={
          <button type="button" onClick={() => setOpen(true)} className={btn.primary}>
            <UserPlus className="h-4 w-4" /> Add member
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {ROLE_OPTIONS.map((r) => {
          const meta = ROLE_META[r];
          const Icon = meta.icon;
          return (
            <div key={r} className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", meta.tint)}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">{ROLE_LABEL[r]}</p>
                  <p className="tabular text-xs text-muted-foreground">
                    {data ? `${counts[r] ?? 0} ${(counts[r] ?? 0) === 1 ? "member" : "members"}` : "—"}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ROLE_HELP[r]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}

      <Panel
        title="Members"
        description={data ? `${members.length} ${members.length === 1 ? "account" : "accounts"}` : "Loading…"}
        icon={<Users className="h-4 w-4" />}
        bodyClassName="p-0 pt-2"
      >
        {isLoading && !data ? (
          <LoadingBlock label="Loading team…" />
        ) : members.length === 0 ? (
          <EmptyState icon={<Users className="h-7 w-7" />} title="No accounts yet" text="Add the first colleague so changes are signed with their name." />
        ) : (
          <ul className="divide-y border-t">
            {members.map((m) => {
              const self = String(m.id) === String(user?.id);
              const name = memberName(m);
              const role = m.role?.id ?? ROLE.viewer;
              const busy = busyId === m.id;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5 transition-colors hover:bg-accent/30">
                  <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
                    <Avatar name={name} className="h-10 w-10 text-sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-semibold">
                        <span className="truncate">{name}</span>
                        {self ? (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">You</span>
                        ) : null}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" aria-hidden />
                          <span className="truncate">{m.email ?? "no email"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
                          since {fmtDate(m.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {busy ? <Spinner className="h-4 w-4" /> : null}
                    {self ? (
                      <RoleBadge roleId={role} />
                    ) : (
                      <>
                        <RoleBadge roleId={role} className="hidden lg:inline-flex" />
                        <SelectInput
                          value={role}
                          disabled={busy}
                          onChange={(e) => void changeRole(m, Number(e.target.value))}
                          className="h-9 w-32"
                          aria-label={`Role of ${name}`}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                        </SelectInput>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={self || busy}
                      onClick={() => void removeMember(m)}
                      className={cn(btn.icon, "hover:bg-bad/10 hover:text-bad disabled:hover:bg-transparent")}
                      aria-label={self ? "You cannot delete your own account" : `Delete ${name}`}
                      title={self ? "You cannot delete your own account" : "Delete account"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
