"use client";

import { useCallback, useMemo, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit as isTeam } from "@/lib/auth/roles";
import { fieldErrorCode, useApiErrorText } from "@/lib/api/fieldErrors";
import { isDemoActive } from "@/lib/demo/mode";
import { WALLET_KEY } from "@/lib/wallet/hooks";
import { MY_COMPANIES_KEY, isCompanyKey } from "@/lib/companies/hooks";
import { CLIENT_POINT_LIMIT } from "./limits";
import { POINT_ERRORS, TEAM_POINTS_KEY, TeamPointsApi, pointTitle, type TeamPoint, type TeamPointInput } from "./team-points";

/** Lists that show map points besides the map itself: company profiles and "My companies" */
function showsPoints(key: unknown): boolean {
  return isCompanyKey(key) || key === MY_COMPANIES_KEY;
}

export function usePointErrorText() {
  return useApiErrorText("points", POINT_ERRORS);
}

/** Every point the caller may see: the team sees all, clients see public points and their own */
export function useTeamPoints() {
  const { isAuthed } = useAuth();
  return useSWR<TeamPoint[]>(isAuthed ? TEAM_POINTS_KEY : null, () => TeamPointsApi.list(), {
    refreshInterval: 120_000,
    keepPreviousData: true,
  });
}

/** Points a client may still add (null = no limit, the team) */
export function usePointQuota(points: TeamPoint[] | undefined) {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user || isTeam(user)) return { limited: false, own: 0, remaining: null as number | null, limit: CLIENT_POINT_LIMIT };
    const own = (points ?? []).filter((p) => p.createdBy && String(p.createdBy.id) === String(user.id)).length;
    return { limited: true, own, remaining: Math.max(0, CLIENT_POINT_LIMIT - own), limit: CLIENT_POINT_LIMIT };
  }, [points, user]);
}

export function useTeamPointMutations() {
  const { mutate } = useSWRConfig();
  const t = useTranslations("points");
  const errorText = usePointErrorText();

  const replace = useCallback(
    async (saved: TeamPoint) => {
      await mutate(TEAM_POINTS_KEY, (list?: TeamPoint[]) => list?.map((p) => (p.id === saved.id ? saved : p)), { revalidate: false });
      void mutate(showsPoints);
    },
    [mutate],
  );

  const create = useCallback(
    async (input: TeamPointInput) => {
      try {
        const saved = await TeamPointsApi.create(input);
        await mutate(TEAM_POINTS_KEY, (list?: TeamPoint[]) => [saved, ...(list ?? [])], { revalidate: false });
        void mutate(showsPoints);
        toast.success(t("toast.added", { title: pointTitle(saved) }));
        return saved;
      } catch (e) {
        toast.error(errorText(e));
        throw e;
      }
    },
    [mutate, t, errorText],
  );

  const update = useCallback(
    async (id: string, input: TeamPointInput) => {
      try {
        const saved = await TeamPointsApi.update(id, input);
        await replace(saved);
        toast.success(t("toast.saved"));
        return saved;
      } catch (e) {
        toast.error(errorText(e));
        throw e;
      }
    },
    [replace, t, errorText],
  );

  const remove = useCallback(
    async (point: TeamPoint) => {
      try {
        await TeamPointsApi.remove(point.id);
        await mutate(TEAM_POINTS_KEY, (list?: TeamPoint[]) => list?.filter((p) => p.id !== point.id), { revalidate: false });
        void mutate(showsPoints);
        toast.success(t("toast.removed", { title: pointTitle(point) }));
      } catch (e) {
        toast.error(errorText(e));
        throw e;
      }
    },
    [mutate, t, errorText],
  );

  return { create, update, remove, replace };
}

/** Paid activity slot and email confirmation of a saved point; errors come back to the caller as text */
export function usePointExtras() {
  const { mutate } = useSWRConfig();
  const t = useTranslations("points");
  const errorText = usePointErrorText();
  const { replace } = useTeamPointMutations();

  const buySlot = useCallback(
    async (point: TeamPoint): Promise<{ point: TeamPoint } | { error: string; insufficient: boolean }> => {
      try {
        const saved = await TeamPointsApi.buyActivitySlot(point.id);
        await replace(saved);
        void mutate(WALLET_KEY);
        toast.success(t("slots.bought", { count: saved.activitySlots }));
        return { point: saved };
      } catch (e) {
        return { error: errorText(e), insufficient: fieldErrorCode(e, POINT_ERRORS) === "balance.insufficient" };
      }
    },
    [replace, mutate, t, errorText],
  );

  /** null on success, else the error text and whether it is the 60-second resend cooldown */
  const sendVerification = useCallback(
    async (point: TeamPoint): Promise<{ error: string; tooSoon: boolean } | null> => {
      try {
        await TeamPointsApi.sendEmailVerification(point.id);
        if (isDemoActive()) {
          // the demo has no mailbox: the address is confirmed right away
          toast.success(t("email.demoConfirmed"), { description: point.email ?? undefined });
          await mutate(TEAM_POINTS_KEY);
          void mutate(showsPoints);
        } else {
          toast.success(t("email.sent", { email: point.email ?? "" }));
        }
        return null;
      } catch (e) {
        const code = fieldErrorCode(e, POINT_ERRORS);
        // someone else confirmed it meanwhile: show the fresh state
        if (code === "email.alreadyVerified") {
          void mutate(TEAM_POINTS_KEY);
          void mutate(showsPoints);
        }
        return { error: errorText(e), tooSoon: code === "email.tooSoon" };
      }
    },
    [mutate, t, errorText],
  );

  const markVerified = useCallback(
    async (point: TeamPoint): Promise<string | null> => {
      try {
        await replace(await TeamPointsApi.markEmailVerified(point.id));
        toast.success(t("email.marked"));
        return null;
      } catch (e) {
        return errorText(e);
      }
    },
    [replace, t, errorText],
  );

  return { buySlot, sendVerification, markVerified };
}

/** Personal favourite with an optimistic flip; reverted with a toast when the server refuses */
export function useFavoriteToggle() {
  const { mutate } = useSWRConfig();
  const t = useTranslations("points");
  const errorText = usePointErrorText();
  const inFlight = useRef(new Set<string>());

  return useCallback(
    async (point: TeamPoint) => {
      if (inFlight.current.has(point.id)) return;
      inFlight.current.add(point.id);
      const next = !point.isFavorite;
      const patch = (value: boolean) =>
        mutate(TEAM_POINTS_KEY, (list?: TeamPoint[]) => list?.map((p) => (p.id === point.id ? { ...p, isFavorite: value } : p)), {
          revalidate: false,
        });
      await patch(next);
      try {
        const saved = await TeamPointsApi.setFavorite(point.id, next);
        if (saved !== next) await patch(saved);
        void mutate(showsPoints);
        toast.success(saved ? t("toast.favoriteOn") : t("toast.favoriteOff"));
      } catch (e) {
        await patch(point.isFavorite);
        toast.error(errorText(e));
      } finally {
        inFlight.current.delete(point.id);
      }
    },
    [mutate, t, errorText],
  );
}
