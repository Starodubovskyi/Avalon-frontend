"use client";

import { useCallback, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { VesselsApi } from "@/lib/api/vessels";
import { useVesselMutations } from "@/lib/vessels/hooks";
import type { VesselInput, VesselView } from "@/lib/vessels/types";
import { AgencyRequestsApi, requestError } from "./api";
import type { AgencyRequest, CreateAgencyRequestDto, UpdateAgencyRequestDto } from "./types";

const LIST_KEY = "agency-requests";
const REFRESH_MS = 60_000;
/** vessel.notes column limit (CreateVesselDto @MaxLength) */
const VESSEL_NOTES_MAX = 4000;

/** Staff and admins get every request, viewers only their own (server-side filter) */
export function useAgencyRequests() {
  const { isAuthed } = useAuth();
  return useSWR<AgencyRequest[]>(isAuthed ? LIST_KEY : null, () => AgencyRequestsApi.list(), {
    refreshInterval: REFRESH_MS,
    keepPreviousData: true,
  });
}

/** Count of `new` requests for the staff menu badge (shares the list cache, no extra call on /requests) */
export function useNewRequestsCount(): number {
  const { user } = useAuth();
  const { data } = useSWR<AgencyRequest[]>(canEdit(user) ? LIST_KEY : null, () => AgencyRequestsApi.list(), {
    refreshInterval: REFRESH_MS,
    shouldRetryOnError: false,
  });
  return useMemo(() => data?.filter((r) => r.status === "new").length ?? 0, [data]);
}

/** Board vessel built from a client's request */
export function vesselFromRequest(r: AgencyRequest): VesselInput {
  const notes = [
    `Agency request from ${r.contactName}, ${r.company}`,
    r.cargo ? `Cargo: ${r.cargo}` : null,
    r.notes,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    name: r.vesselName,
    imo: r.imo,
    type: r.vesselType,
    destination: r.destination,
    etaSulina: r.eta,
    officeName: r.company,
    officePhone: r.phone,
    officeEmail: r.email,
    notes: notes.slice(0, VESSEL_NOTES_MAX),
  };
}

/** The board vessel that already carries this IMO (after a 422 imoAlreadyExists), or null */
export async function findVesselByImo(imo: string | null): Promise<VesselView | null> {
  if (!imo) return null;
  try {
    const found = await VesselsApi.list("all", imo);
    return found.find((v) => v.imo === imo) ?? null;
  } catch {
    return null;
  }
}

export class BoardLinkError extends Error {
  constructor(public readonly vessel: VesselView, cause: unknown) {
    super(`${vessel.name} is on the board, but the request was not updated: ${requestError(cause)}`);
    this.name = "BoardLinkError";
  }
}

export function useRequestMutations() {
  const { mutate } = useSWRConfig();
  const vessels = useVesselMutations();

  const put = useCallback(
    async (saved: AgencyRequest) => {
      await mutate(
        LIST_KEY,
        (list?: AgencyRequest[]) => {
          if (!list) return [saved];
          const idx = list.findIndex((r) => r.id === saved.id);
          if (idx === -1) return [saved, ...list];
          const next = list.slice();
          next[idx] = saved;
          return next;
        },
        { revalidate: false },
      );
    },
    [mutate],
  );

  const create = useCallback(
    async (input: CreateAgencyRequestDto) => {
      const saved = await AgencyRequestsApi.create(input);
      await put(saved);
      return saved;
    },
    [put],
  );

  const update = useCallback(
    async (id: string, input: UpdateAgencyRequestDto, successText?: string) => {
      try {
        const saved = await AgencyRequestsApi.update(id, input);
        await put(saved);
        if (successText) toast.success(successText);
        return saved;
      } catch (e) {
        toast.error(requestError(e));
        throw e;
      }
    },
    [put],
  );

  /**
   * Creates the vessel on the board, then links it and accepts the request.
   * Pass `existing` to retry only the link step after a failed PATCH (no second vessel).
   */
  const addToBoard = useCallback(
    async (request: AgencyRequest, existing?: VesselView) => {
      const vessel = existing ?? (await vessels.create(vesselFromRequest(request)));
      try {
        const saved = await AgencyRequestsApi.update(request.id, { status: "accepted", vesselId: vessel.id });
        await put(saved);
        toast.success(`Request accepted — ${vessel.name} is on the board`);
        return { request: saved, vessel };
      } catch (e) {
        throw new BoardLinkError(vessel, e);
      }
    },
    [put, vessels],
  );

  return { create, update, addToBoard };
}
