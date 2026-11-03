"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { CalendarDays, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TeamApi, type TeamMember } from "@/lib/api/team";
import { useErrorText } from "@/lib/api/errorText";
import { useAuth } from "@/lib/auth/useAuth";
import { ROLE } from "@/lib/auth/roles";
import { Avatar, btn, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, SelectInput, Spinner } from "../ui/primitives";
import { CreateMemberDialog } from "./CreateMemberDialog";
import { memberName, ROLE_META, ROLE_OPTIONS, RoleBadge, useRoleText } from "./teamMeta";
import { useTimeFormat } from "../network/useTimeFormat";

export function TeamView() {
  const t = useTranslations("team");
  const errorText = useErrorText();
  const role = useRoleText();
  const time = useTimeFormat();
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
      toast.success(t("roleChanged", { name: memberName(m), role: role.label(roleId) }));
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusyId(null);
    }
  }

  async function removeMember(m: TeamMember) {
    if (!window.confirm(t("confirmDelete", { name: memberName(m) }))) return;
    setBusyId(m.id);
    try {
      await TeamApi.remove(m.id);
      await mutate();
      toast.success(t("deleted"));
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusyId(null);
    }
  }

  const members = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <button type="button" onClick={() => setOpen(true)} className={btn.primary}>
            <UserPlus className="h-4 w-4" aria-hidden /> {t("add")}
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
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="min-w-0 font-semibold">{role.label(r)}</p>
                  <p className="tabular text-xs text-muted-foreground">{data ? t("memberCount", { count: counts[r] ?? 0 }) : "—"}</p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{role.help(r)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}

      <Panel
        title={t("members")}
        description={data ? t("accounts", { count: members.length }) : t("loading")}
        icon={<Users className="h-4 w-4" />}
        bodyClassName="p-0 pt-2"
      >
        {isLoading && !data ? (
          <LoadingBlock label={t("loadingTeam")} />
        ) : members.length === 0 ? (
          <EmptyState icon={<Users className="h-7 w-7" />} title={t("emptyTitle")} text={t("emptyText")} />
        ) : (
          <ul className="divide-y border-t">
            {members.map((m) => {
              const self = String(m.id) === String(user?.id);
              const name = memberName(m);
              const roleId = m.role?.id ?? ROLE.viewer;
              const busy = busyId === m.id;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5 transition-colors hover:bg-accent/30">
                  <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
                    <Avatar name={name} className="h-10 w-10 text-sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-semibold">
                        <span className="truncate">{name}</span>
                        {self ? (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">{t("you")}</span>
                        ) : null}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" aria-hidden />
                          <span className="truncate">{m.email ?? t("noEmail")}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
                          {t("since", { date: time.dateYear(m.createdAt) })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {busy ? <Spinner className="h-4 w-4" /> : null}
                    {self ? (
                      <RoleBadge roleId={roleId} />
                    ) : (
                      <>
                        <RoleBadge roleId={roleId} className="hidden lg:inline-flex" />
                        <SelectInput
                          value={roleId}
                          disabled={busy}
                          onChange={(e) => void changeRole(m, Number(e.target.value))}
                          className="h-9 w-auto min-w-[8rem]"
                          aria-label={t("roleOf", { name })}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{role.label(r)}</option>
                          ))}
                        </SelectInput>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={self || busy}
                      onClick={() => void removeMember(m)}
                      className={cn(btn.icon, "hover:bg-bad/10 hover:text-bad disabled:hover:bg-transparent")}
                      aria-label={self ? t("cantDeleteSelf") : t("deleteAria", { name })}
                      title={self ? t("cantDeleteSelf") : t("deleteTitle")}
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
