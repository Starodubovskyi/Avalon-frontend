import type { Destination, VesselView } from "./types";

export type LngLat = [number, number];

/** Approximate berth areas; used only when a vessel has no AIS/manual position */
export const PORT_COORDS: Record<Destination, LngLat> = {
  IZMAIL: [28.838, 45.342],
  RENI: [28.285, 45.445],
  ORLIVKA: [28.459, 45.297],
  GIURGIULESTI: [28.205, 45.47],
  GALATI: [28.048, 45.435],
  BRAILA: [27.975, 45.269],
  TULCEA: [28.805, 45.179],
};

export const SULINA_ROADS: LngLat = [29.79, 45.13];
export const DANUBE_VIEW = { center: [28.95, 45.25] as LngLat, zoom: 7.4 };

/** Stable pseudo-random offset so estimated markers don't stack */
function jitter(id: string): LngLat {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = ((h & 0xffff) / 0xffff - 0.5) * 0.05;
  const b = (((h >>> 16) & 0xffff) / 0xffff - 0.5) * 0.035;
  return [a, b];
}

export interface ResolvedPosition {
  lngLat: LngLat;
  estimated: boolean;
}

export function resolvePosition(v: VesselView): ResolvedPosition {
  if (typeof v.lat === "number" && typeof v.lng === "number") {
    return { lngLat: [v.lng, v.lat], estimated: false };
  }
  const anchor =
    v.stage === "in_port" || v.stage === "departed"
      ? PORT_COORDS[v.destination]
      : SULINA_ROADS;
  const [dx, dy] = jitter(v.id);
  return { lngLat: [anchor[0] + dx, anchor[1] + dy], estimated: true };
}

export function marineTrafficUrl(v: Pick<VesselView, "imo" | "mmsi" | "name">): string {
  if (v.imo) return `https://www.marinetraffic.com/en/ais/details/ships/imo:${v.imo}`;
  if (v.mmsi) return `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${v.mmsi}`;
  return `https://www.marinetraffic.com/en/ais/index/search/all/keyword:${encodeURIComponent(v.name)}`;
}
