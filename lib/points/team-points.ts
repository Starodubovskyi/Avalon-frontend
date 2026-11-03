"use client";

import { useCallback, useRef } from "react";
import axios from "axios";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import api from "@/lib/api/client";
import { extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import type { UserRef } from "@/lib/vessels/types";
import { activityFromText, toActivityCodes, type ActivityCode } from "./activities";
import { POINT_KIND_COLORS as KIND_COLORS } from "./kind-colors";

/** Team-wide points on the fleet map (backend /map-points, staff and admins only) */
export const POINT_KINDS = ["head_office", "branch", "self_employed", "for_sale", "authority", "private_person"] as const;
export type PointKind = (typeof POINT_KINDS)[number];

/** Kind preselected in the "Add point" form and the Companies "Add on map" link */
export const DEFAULT_FORM_KIND: PointKind = "head_office";
/** Kind the API stores when none is sent (backend DEFAULT_MAP_POINT_KIND); also the fallback for unknown kinds */
export const DEFAULT_POINT_KIND: PointKind = "private_person";

export const POINT_KIND_LABEL: Record<PointKind, string> = {
  head_office: "Company head office",
  branch: "Company branch",
  self_employed: "Self-employed",
  for_sale: "For sale",
  authority: "Government agency / authority",
  private_person: "Private person / employee",
};

/** Compact name for tiles, chips and the legend */
export const POINT_KIND_SHORT: Record<PointKind, string> = {
  head_office: "Head office",
  branch: "Branch",
  self_employed: "Self-employed",
  for_sale: "For sale",
  authority: "Authority",
  private_person: "Person",
};

export const POINT_KIND_PLURAL: Record<PointKind, string> = {
  head_office: "Head offices",
  branch: "Branches",
  self_employed: "Self-employed",
  for_sale: "For sale",
  authority: "Authorities",
  private_person: "People",
};

/** Short hint shown in the type picker */
export const POINT_KIND_HINT: Record<PointKind, string> = {
  head_office: "Headquarters of an owner, agency or trader",
  branch: "Branch office, terminal, berth or yard",
  self_employed: "Independent surveyor, broker or pilot",
  for_sale: "Vessel, berth or business on sale",
  authority: "Harbour master, customs, border police",
  private_person: "Captain, crew or team member",
};

/** Canvas colours for map markers (lib/points/kind-colors.ts, shared with Tailwind point.*) */
export const POINT_KIND_COLORS: Record<PointKind, { base: string; light: string; dark: string }> = KIND_COLORS;

/** Old kinds (before GeoPointsV2) mapped the way the migration does */
const LEGACY_KIND: Record<string, PointKind> = {
  company: "head_office",
  agency: "head_office",
  terminal: "branch",
  authority: "authority",
  person: "private_person",
  employee: "private_person",
};

export function toPointKind(value: unknown): PointKind {
  if (typeof value !== "string") return DEFAULT_POINT_KIND;
  if ((POINT_KINDS as readonly string[]).includes(value)) return value as PointKind;
  return LEGACY_KIND[value] ?? DEFAULT_POINT_KIND;
}

export interface TeamPoint {
  id: string;
  kind: PointKind;
  lat: number;
  lng: number;
  /** Title of the point */
  firstName: string;
  /** Legacy: people had a separate last name; new points keep it empty */
  lastName: string;
  /** Legacy free text, shown only when no activity code is set */
  activity: string;
  activities: ActivityCode[];
  /** The image itself comes from GET /map-points/:id/logo?v=<logoVersion> (lib/points/logo-cache.ts) */
  hasLogo: boolean;
  /** Changes whenever the logo changes; null without a logo */
  logoVersion: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isFavorite: boolean;
  /** Rank of the author of the point */
  rank: number;
  createdBy: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamPointInput {
  kind?: PointKind;
  lat?: number;
  lng?: number;
  firstName?: string;
  /** Sent only to clear a legacy last name */
  lastName?: string;
  /** Legacy free text: the form sends "" so an edited point shows only its activity codes */
  activity?: string;
  activities?: ActivityCode[];
  /** New logo as a data URL, null removes it; omitted keeps the stored one */
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

type RawPoint = Omit<TeamPoint, "kind" | "activities" | "hasLogo" | "logoVersion" | "isFavorite" | "rank" | "lastName" | "activity"> & {
  kind?: unknown;
  activities?: unknown;
  hasLogo?: unknown;
  logoVersion?: unknown;
  isFavorite?: unknown;
  rank?: unknown;
  lastName?: string | null;
  activity?: string | null;
};

/** Tolerates older API answers (legacy kinds, no activities/rank/logo fields yet) */
export function normalizePoint(raw: RawPoint): TeamPoint {
  const activities = toActivityCodes(raw.activities);
  const legacy = activityFromText(raw.activity);
  return {
    ...raw,
    kind: toPointKind(raw.kind),
    lastName: raw.lastName ?? "",
    activity: raw.activity ?? "",
    activities: activities.length || Array.isArray(raw.activities) ? activities : legacy ? [legacy] : [],
    hasLogo: raw.hasLogo === true && typeof raw.logoVersion === "string" && raw.logoVersion !== "",
    logoVersion: raw.hasLogo === true && typeof raw.logoVersion === "string" && raw.logoVersion !== "" ? raw.logoVersion : null,
    isFavorite: raw.isFavorite === true,
    rank: typeof raw.rank === "number" && Number.isFinite(raw.rank) ? raw.rank : 0,
  };
}

export function pointTitle(p: Pick<TeamPoint, "firstName" | "lastName">): string {
  return [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || p.firstName;
}

export function fmtRank(rank: number): string {
  return Math.max(0, Math.round(rank)).toLocaleString("en-US");
}

const FIELD_ERROR: Record<string, Record<string, string>> = {
  activities: {
    premiumRequired: "One Business Activity is free. More activities need Premium — with balance.",
    invalid: "Choose the Business Activity from the list.",
  },
  logo: {
    invalid: "The logo must be a PNG, JPEG or WebP image.",
    tooLong: "The logo is too large — choose a simpler image.",
  },
};

/** Readable message for a failed save: the API's field codes (premiumRequired, invalid, tooLong) get real wording */
export function pointErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const errors: unknown = (e.response?.data as { errors?: unknown } | undefined)?.errors;
    if (errors && typeof errors === "object") {
      for (const [field, codes] of Object.entries(FIELD_ERROR)) {
        const code = (errors as Record<string, unknown>)[field];
        if (typeof code === "string" && codes[code]) return codes[code];
      }
    }
  }
  return extractAuthError(e);
}

export const TEAM_POINTS_KEY = "team-points";

export const TeamPointsApi = {
  async list(): Promise<TeamPoint[]> {
    const { data } = await api.get<RawPoint[]>("/map-points");
    return data.map(normalizePoint);
  },
  async create(input: TeamPointInput): Promise<TeamPoint> {
    const { data } = await api.post<RawPoint>("/map-points", input);
    return normalizePoint(data);
  },
  async update(id: string, input: TeamPointInput): Promise<TeamPoint> {
    const { data } = await api.patch<RawPoint>(`/map-points/${id}`, input);
    return normalizePoint(data);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/map-points/${id}`);
  },
  async setFavorite(id: string, on: boolean): Promise<boolean> {
    const { data } = on
      ? await api.post<{ isFavorite?: boolean }>(`/map-points/${id}/favorite`)
      : await api.delete<{ isFavorite?: boolean }>(`/map-points/${id}/favorite`);
    return typeof data?.isFavorite === "boolean" ? data.isFavorite : on;
  },
};

export function useTeamPoints() {
  const { user } = useAuth();
  return useSWR<TeamPoint[]>(canEdit(user) ? TEAM_POINTS_KEY : null, () => TeamPointsApi.list(), {
    refreshInterval: 120_000,
    keepPreviousData: true,
  });
}

export function useTeamPointMutations() {
  const { mutate } = useSWRConfig();

  const create = useCallback(
    async (input: TeamPointInput) => {
      try {
        const saved = await TeamPointsApi.create(input);
        await mutate(TEAM_POINTS_KEY, (list?: TeamPoint[]) => [saved, ...(list ?? [])], { revalidate: false });
        toast.success(`${POINT_KIND_SHORT[saved.kind]} “${pointTitle(saved)}” added to the map`);
        return saved;
      } catch (e) {
        toast.error(pointErrorMessage(e));
        throw e;
      }
    },
    [mutate],
  );

  const update = useCallback(
    async (id: string, input: TeamPointInput) => {
      try {
        const saved = await TeamPointsApi.update(id, input);
        await mutate(TEAM_POINTS_KEY, (list?: TeamPoint[]) => list?.map((p) => (p.id === id ? saved : p)), { revalidate: false });
        toast.success("Saved");
        return saved;
      } catch (e) {
        toast.error(pointErrorMessage(e));
        throw e;
      }
    },
    [mutate],
  );

  const remove = useCallback(
    async (point: TeamPoint) => {
      try {
        await TeamPointsApi.remove(point.id);
        await mutate(TEAM_POINTS_KEY, (list?: TeamPoint[]) => list?.filter((p) => p.id !== point.id), { revalidate: false });
        toast.success(`“${pointTitle(point)}” removed`);
      } catch (e) {
        toast.error(extractAuthError(e));
        throw e;
      }
    },
    [mutate],
  );

  return { create, update, remove };
}

/** Personal favourite with an optimistic flip; reverted with a toast when the server refuses */
export function useFavoriteToggle() {
  const { mutate } = useSWRConfig();
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
        toast.success(saved ? "Added to favorites" : "Removed from favorites");
      } catch (e) {
        await patch(point.isFavorite);
        toast.error(extractAuthError(e));
      } finally {
        inFlight.current.delete(point.id);
      }
    },
    [mutate],
  );
}
