"use client";

import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { useApiErrorText } from "@/lib/api/fieldErrors";
import { TEAM_POINTS_KEY, type TeamPoint } from "@/lib/points/team-points";
import { isProfileKey } from "@/lib/profiles/hooks";
import { COMPANY_ERRORS, CompaniesApi } from "./api";
import type { CompanyMember, CompanyProfile } from "./types";

type CompanyKey = readonly ["company", string];

export const MY_COMPANIES_KEY = "companies-mine";

export function isCompanyKey(key: unknown): boolean {
  return Array.isArray(key) && key[0] === "company";
}

/** Any profile, people list or my-companies list that shows memberships */
function touchesMemberships(key: unknown): boolean {
  return isCompanyKey(key) || key === MY_COMPANIES_KEY || isProfileKey(key);
}

export function useCompany(pointId: string | null) {
  const { isAuthed } = useAuth();
  const key: CompanyKey | null = isAuthed && pointId ? ["company", pointId] : null;
  return useSWR<CompanyProfile>(key, ([, id]: CompanyKey) => CompaniesApi.get(id), { shouldRetryOnError: false });
}

export function useMyCompanies(enabled = true) {
  const { isAuthed } = useAuth();
  return useSWR<TeamPoint[]>(isAuthed && enabled ? MY_COMPANIES_KEY : null, () => CompaniesApi.mine(), { keepPreviousData: true });
}

/** I work here / leave, and the owner's (or team's) approve · position · remove — each with a toast */
export function useCompanyActions(pointId: string) {
  const { mutate } = useSWRConfig();
  const t = useTranslations("companies");
  const errorText = useApiErrorText("companies", COMPANY_ERRORS);

  const refresh = useCallback(async () => {
    await mutate(touchesMemberships);
    void mutate(TEAM_POINTS_KEY);
  }, [mutate]);

  const run = useCallback(
    async <T,>(action: () => Promise<T>, success: string): Promise<T | null> => {
      try {
        const out = await action();
        toast.success(success);
        return out;
      } catch (e) {
        toast.error(errorText(e));
        return null;
      }
    },
    [errorText],
  );

  const join = useCallback(
    async (position: string | null) => {
      const saved = await run(() => CompaniesApi.join(pointId, position), t("toast.joinSent"));
      if (saved) {
        const key: CompanyKey = ["company", pointId];
        await mutate(key, saved, { revalidate: false });
        void mutate(MY_COMPANIES_KEY);
      }
      return !!saved;
    },
    [mutate, pointId, run, t],
  );

  const leave = useCallback(async () => {
    const done = await run(async () => {
      await CompaniesApi.leave(pointId);
      return true;
    }, t("toast.left"));
    if (done) await refresh();
    return !!done;
  }, [pointId, refresh, run, t]);

  const approve = useCallback(
    async (m: CompanyMember) => {
      const done = await run(() => CompaniesApi.updateMember(pointId, m.user.id, { status: "active" }), t("toast.approved"));
      if (done) await refresh();
    },
    [pointId, refresh, run, t],
  );

  const setPosition = useCallback(
    async (m: CompanyMember, position: string | null) => {
      const done = await run(() => CompaniesApi.updateMember(pointId, m.user.id, { position }), t("toast.positionSaved"));
      if (done) await refresh();
      return !!done;
    },
    [pointId, refresh, run, t],
  );

  const remove = useCallback(
    async (m: CompanyMember) => {
      const done = await run(async () => {
        await CompaniesApi.removeMember(pointId, m.user.id);
        return true;
      }, m.status === "pending" ? t("toast.declined") : t("toast.removed"));
      if (done) await refresh();
    },
    [pointId, refresh, run, t],
  );

  return { join, leave, approve, setPosition, remove };
}
