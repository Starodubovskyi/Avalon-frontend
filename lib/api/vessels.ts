"use client";

import api from "./client";
import type {
  AisStatus,
  VesselEventView,
  VesselInput,
  VesselView,
} from "@/lib/vessels/types";

export type VesselScope = "active" | "departed" | "all";

export const VesselsApi = {
  async list(scope: VesselScope = "all", search?: string): Promise<VesselView[]> {
    const { data } = await api.get<VesselView[]>("/vessels", {
      params: { scope, ...(search ? { search } : {}) },
    });
    return data;
  },

  async get(id: string): Promise<VesselView> {
    const { data } = await api.get<VesselView>(`/vessels/${id}`);
    return data;
  },

  async create(input: VesselInput): Promise<VesselView> {
    const { data } = await api.post<VesselView>("/vessels", input);
    return data;
  },

  async update(id: string, input: VesselInput): Promise<VesselView> {
    const { data } = await api.patch<VesselView>(`/vessels/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/vessels/${id}`);
  },

  async events(id: string): Promise<VesselEventView[]> {
    const { data } = await api.get<VesselEventView[]>(`/vessels/${id}/events`);
    return data;
  },

  /** Keyset paging: pass the last event's createdAt + id so rows sharing a millisecond are not skipped */
  async feed(limit = 100, before?: { createdAt: string; id: string }): Promise<VesselEventView[]> {
    const { data } = await api.get<VesselEventView[]>("/vessel-events", {
      params: { limit, ...(before ? { before: before.createdAt, beforeId: before.id } : {}) },
    });
    return data;
  },

  async aisStatus(): Promise<AisStatus> {
    const { data } = await api.get<AisStatus>("/ais/status");
    return data;
  },
};
