"use client";

import api, { ensureAccessToken } from "./client";
import { isAbortError } from "./map-points";
import {
  CATALOG_LAYER_KINDS,
  type CatalogLayerKind,
  type GeoJsonFeatureCollection,
  type GeoJsonPointFeature,
  type MapLayerKind,
  type MapLayersResponse,
} from "@/lib/domain/map-layer";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asKind(value: unknown): MapLayerKind | undefined {
  if (
    value === "person" ||
    value === "company" ||
    value === "vessel" ||
    value === "port"
  ) {
    return value;
  }
  return undefined;
}

function asCoordinates(value: unknown): [number, number] | undefined {
  if (!Array.isArray(value) || value.length < 2) return undefined;
  const lng = value[0];
  const lat = value[1];
  if (typeof lng !== "number" || typeof lat !== "number") return undefined;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined;
  return [lng, lat];
}

export function parseGeoJsonPointFeature(
  raw: unknown,
): GeoJsonPointFeature | null {
  if (!isRecord(raw) || raw.type !== "Feature") return null;
  if (!isRecord(raw.geometry) || raw.geometry.type !== "Point") return null;
  const coordinates = asCoordinates(raw.geometry.coordinates);
  if (!coordinates) return null;
  if (!isRecord(raw.properties)) return null;
  const kind = asKind(raw.properties.kind);
  const title = asString(raw.properties.title);
  if (!kind || !title) return null;

  const subtitleRaw = raw.properties.subtitle;
  const subtitle =
    typeof subtitleRaw === "string" && subtitleRaw.trim().length > 0
      ? subtitleRaw.trim()
      : null;
  const href = asString(raw.properties.href);

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: {
      kind,
      title,
      subtitle,
      ...(href ? { href } : {}),
    },
  };
}

export function parseFeatureCollection(
  raw: unknown,
): GeoJsonFeatureCollection {
  if (!isRecord(raw) || raw.type !== "FeatureCollection") {
    return { type: "FeatureCollection", features: [] };
  }
  const list = Array.isArray(raw.features) ? raw.features : [];
  return {
    type: "FeatureCollection",
    features: list
      .map(parseGeoJsonPointFeature)
      .filter((feature): feature is GeoJsonPointFeature => feature !== null),
  };
}

export function parseMapLayersResponse(raw: unknown): MapLayersResponse {
  if (!isRecord(raw)) return {};
  const response: MapLayersResponse = {};
  for (const kind of CATALOG_LAYER_KINDS) {
    if (!(kind in raw)) continue;
    response[kind] = parseFeatureCollection(raw[kind]);
  }
  return response;
}

export async function listMapLayers(
  kinds: CatalogLayerKind[] = [...CATALOG_LAYER_KINDS],
  signal?: AbortSignal,
): Promise<MapLayersResponse> {
  await ensureAccessToken();
  const res = await api.get<unknown>("/map/layers", {
    signal,
    params: { kinds: kinds.join(",") },
  });
  return parseMapLayersResponse(res.data);
}

export { isAbortError };

export const MapLayersApi = {
  list: listMapLayers,
};
