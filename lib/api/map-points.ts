"use client";

import api, { ensureAccessToken } from "./client";
import type {
  CreateMapPointDto,
  MapPoint,
  UpdateMapPointDto,
} from "@/lib/domain/map-point";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asUserId(value: unknown): string | number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) return value;
  return undefined;
}

function toIsoDate(value: unknown): string {
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return new Date().toISOString();
}

function nullableText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseMapPoint(raw: unknown): MapPoint | null {
  if (!isRecord(raw)) return null;
  const lat = asNumber(raw.lat);
  const lng = asNumber(raw.lng);
  const id = asString(raw.id);
  const userId = asUserId(raw.userId);
  const firstName = asString(raw.firstName);
  if (
    lat === undefined ||
    lng === undefined ||
    !id ||
    userId === undefined ||
    firstName === undefined
  ) {
    return null;
  }

  return {
    id,
    userId,
    lat,
    lng,
    firstName,
    lastName: asString(raw.lastName) ?? "",
    activity: asString(raw.activity) ?? "",
    phone: nullableText(raw.phone),
    email: nullableText(raw.email),
    address: nullableText(raw.address),
    photoId: nullableText(raw.photoId),
    isFavorite: asBoolean(raw.isFavorite) ?? false,
    createdAt: toIsoDate(raw.createdAt),
    updatedAt: toIsoDate(raw.updatedAt ?? raw.createdAt),
  };
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (isRecord(raw) && Array.isArray(raw.data)) return raw.data;
  return [];
}

export async function listMapPoints(signal?: AbortSignal): Promise<MapPoint[]> {
  await ensureAccessToken();
  const res = await api.get<unknown>("/map-points", { signal });
  return unwrapList(res.data)
    .map(parseMapPoint)
    .filter((point): point is MapPoint => point !== null);
}

export async function createMapPoint(
  data: CreateMapPointDto,
  signal?: AbortSignal,
): Promise<MapPoint> {
  await ensureAccessToken();
  const res = await api.post<unknown>("/map-points", data, { signal });
  const parsed = parseMapPoint(res.data);
  if (!parsed) throw new Error("Invalid map point response");
  return parsed;
}

export async function updateMapPoint(
  id: string,
  data: UpdateMapPointDto,
): Promise<MapPoint> {
  await ensureAccessToken();
  const res = await api.patch<unknown>(`/map-points/${id}`, data);
  const parsed = parseMapPoint(res.data);
  if (!parsed) throw new Error("Invalid map point response");
  return parsed;
}

export async function deleteMapPoint(id: string): Promise<void> {
  await ensureAccessToken();
  await api.delete(`/map-points/${id}`);
}

export function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  if (typeof error !== "object" || error === null) return false;
  const code = "code" in error ? error.code : undefined;
  const name = "name" in error ? error.name : undefined;
  return code === "ERR_CANCELED" || name === "CanceledError" || name === "AbortError";
}

export const MapPointsApi = {
  list: listMapPoints,
  create: createMapPoint,
  update: updateMapPoint,
  delete: deleteMapPoint,
};
