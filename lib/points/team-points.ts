"use client";

import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import api from "@/lib/api/client";
import { extractAuthError } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import type { UserRef } from "@/lib/vessels/types";

/** Team-wide contacts on the fleet map (backend /map-points, staff and admins only) */
export const POINT_KINDS = ["company", "person", "employee"] as const;
export type PointKind = (typeof POINT_KINDS)[number];

export const POINT_KIND_LABEL: Record<PointKind, string> = {
  company: "Company",
  person: "Contact person",
  employee: "Employee",
};

export const POINT_KIND_PLURAL: Record<PointKind, string> = {
  company: "Companies",
  person: "People",
  employee: "Employees",
};

/** Hex for canvas-drawn map icons; Tailwind uses point.* with the same values */
export const POINT_KIND_HEX: Record<PointKind, string> = {
  company: "#7c3aed",
  person: "#059669",
  employee: "#ea580c",
};

export interface TeamPoint {
  id: string;
  kind: PointKind;
  lat: number;
  lng: number;
  firstName: string;
  lastName: string;
  activity: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdBy: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamPointInput {
  kind?: PointKind;
  lat?: number;
  lng?: number;
  firstName?: string;
  lastName?: string;
  activity?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export function pointTitle(p: Pick<TeamPoint, "kind" | "firstName" | "lastName">): string {
  if (p.kind === "company") return p.firstName;
  return [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || p.firstName;
}

const KEY = "team-points";

export const TeamPointsApi = {
  async list(): Promise<TeamPoint[]> {
    const { data } = await api.get<TeamPoint[]>("/map-points");
    return data.map((p) => ({ ...p, kind: POINT_KINDS.includes(p.kind) ? p.kind : "person" }));
  },
  async create(input: TeamPointInput): Promise<TeamPoint> {
    const { data } = await api.post<TeamPoint>("/map-points", input);
    return data;
  },
  async update(id: string, input: TeamPointInput): Promise<TeamPoint> {
    const { data } = await api.patch<TeamPoint>(`/map-points/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/map-points/${id}`);
  },
};

export function useTeamPoints() {
  const { user } = useAuth();
  return useSWR<TeamPoint[]>(canEdit(user) ? KEY : null, () => TeamPointsApi.list(), {
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
        await mutate(KEY, (list?: TeamPoint[]) => [saved, ...(list ?? [])], { revalidate: false });
        toast.success(`${POINT_KIND_LABEL[saved.kind]} “${pointTitle(saved)}” added to the map`);
        return saved;
      } catch (e) {
        toast.error(extractAuthError(e));
        throw e;
      }
    },
    [mutate],
  );

  const update = useCallback(
    async (id: string, input: TeamPointInput) => {
      try {
        const saved = await TeamPointsApi.update(id, input);
        await mutate(KEY, (list?: TeamPoint[]) => list?.map((p) => (p.id === id ? saved : p)), { revalidate: false });
        toast.success("Saved");
        return saved;
      } catch (e) {
        toast.error(extractAuthError(e));
        throw e;
      }
    },
    [mutate],
  );

  const remove = useCallback(
    async (point: TeamPoint) => {
      try {
        await TeamPointsApi.remove(point.id);
        await mutate(KEY, (list?: TeamPoint[]) => list?.filter((p) => p.id !== point.id), { revalidate: false });
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
