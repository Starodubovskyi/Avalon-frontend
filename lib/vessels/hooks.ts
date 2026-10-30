"use client";

import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { VesselsApi, type VesselScope } from "@/lib/api/vessels";
import { extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import type { VesselInput, VesselView } from "./types";

const LIST_KEY = "vessels";
const REFRESH_MS = 60_000;

type ListKey = readonly [typeof LIST_KEY, VesselScope];

function isListKey(key: unknown): key is ListKey {
  return Array.isArray(key) && key[0] === LIST_KEY;
}

export function useVessels(scope: VesselScope = "all") {
  const { isAuthed } = useAuth();
  return useSWR<VesselView[]>(
    isAuthed ? ([LIST_KEY, scope] as const) : null,
    () => VesselsApi.list(scope),
    { refreshInterval: REFRESH_MS, keepPreviousData: true },
  );
}

export function useVessel(id: string | null) {
  const { isAuthed } = useAuth();
  return useSWR<VesselView>(
    isAuthed && id ? (["vessel", id] as const) : null,
    () => VesselsApi.get(id as string),
    { refreshInterval: REFRESH_MS },
  );
}

export function useVesselEvents(id: string | null) {
  const { user } = useAuth();
  return useSWR(
    canEdit(user) && id ? (["vessel-events", id] as const) : null,
    () => VesselsApi.events(id as string),
  );
}

export function useEventFeed(limit = 100) {
  const { user } = useAuth();
  return useSWR(
    canEdit(user) ? (["event-feed", limit] as const) : null,
    () => VesselsApi.feed(limit),
    { refreshInterval: REFRESH_MS },
  );
}

export function useAisStatus() {
  const { user } = useAuth();
  return useSWR(canEdit(user) ? "ais-status" : null, () => VesselsApi.aisStatus(), {
    refreshInterval: REFRESH_MS,
    shouldRetryOnError: false,
  });
}

/** Out-of-order PATCH responses (rapid toggles) must not roll a newer snapshot back */
function newest(cached: VesselView | undefined, incoming: VesselView): VesselView {
  if (!cached) return incoming;
  return new Date(cached.updatedAt).getTime() > new Date(incoming.updatedAt).getTime() ? cached : incoming;
}

/** Mutations keep every cached list and the detail entry in sync */
export function useVesselMutations() {
  const { mutate } = useSWRConfig();

  const putEverywhere = useCallback(
    async (vessel: VesselView) => {
      await mutate(["vessel", vessel.id], (cur?: VesselView) => newest(cur, vessel), { revalidate: false });
      await mutate(
        isListKey,
        (list?: VesselView[]) => {
          if (!list) return list;
          const idx = list.findIndex((v) => v.id === vessel.id);
          if (idx === -1) return [vessel, ...list];
          const next = list.slice();
          next[idx] = newest(list[idx], vessel);
          return next;
        },
        { revalidate: false },
      );
      void mutate((key) => Array.isArray(key) && (key[0] === "vessel-events" || key[0] === "event-feed"));
    },
    [mutate],
  );

  const update = useCallback(
    async (id: string, input: VesselInput, successText?: string) => {
      try {
        const saved = await VesselsApi.update(id, input);
        await putEverywhere(saved);
        if (successText) toast.success(successText);
        return saved;
      } catch (e) {
        toast.error(extractAuthError(e));
        throw e;
      }
    },
    [putEverywhere],
  );

  const create = useCallback(
    async (input: VesselInput) => {
      const saved = await VesselsApi.create(input);
      await putEverywhere(saved);
      toast.success(`${saved.name} added`);
      return saved;
    },
    [putEverywhere],
  );

  const remove = useCallback(
    async (vessel: VesselView) => {
      await VesselsApi.remove(vessel.id);
      await mutate(
        isListKey,
        (list?: VesselView[]) => list?.filter((v) => v.id !== vessel.id),
        { revalidate: true },
      );
      toast.success(`${vessel.name} removed`);
    },
    [mutate],
  );

  return { update, create, remove };
}
