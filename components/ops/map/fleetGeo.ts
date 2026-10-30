import type { FeatureCollection, Point } from "geojson";
import { PORT_COORDS, SULINA_ROADS, resolvePosition } from "@/lib/vessels/geo";
import { isPositionStale, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { DESTINATIONS, DESTINATION_LABEL, type VesselView } from "@/lib/vessels/types";
import { iconId, type IconShape, type IconTone } from "./shipIcons";

export interface VesselFeatureProps {
  id: string;
  name: string;
  icon: string;
  rotation: number;
  opacity: number;
}

const MOVING_KN = 0.5;

function shapeOf(v: VesselView, estimated: boolean): IconShape {
  if (estimated) return "est";
  if (v.cog !== null && v.sog !== null && v.sog > MOVING_KN) return "arrow";
  return "dot";
}

export function vesselsToGeoJson(vessels: VesselView[]): FeatureCollection<Point, VesselFeatureProps> {
  return {
    type: "FeatureCollection",
    features: vessels.map((v) => {
      const pos = resolvePosition(v);
      const shape = shapeOf(v, pos.estimated);
      const tone: IconTone = isUnpaidAfterDeparture(v) ? "unpaid" : v.stage;
      const stale = !pos.estimated && isPositionStale(v);
      return {
        type: "Feature",
        id: v.id,
        geometry: { type: "Point", coordinates: pos.lngLat },
        properties: {
          id: v.id,
          name: pos.estimated ? `≈ ${v.name}` : v.name,
          icon: iconId(shape, tone),
          rotation: shape === "arrow" ? v.cog ?? 0 : 0,
          opacity: stale ? 0.45 : 1,
        },
      };
    }),
  };
}

export function placesGeoJson(): FeatureCollection<Point, { name: string; kind: "port" | "roads" }> {
  return {
    type: "FeatureCollection",
    features: [
      ...DESTINATIONS.map((d) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: PORT_COORDS[d] },
        properties: { name: DESTINATION_LABEL[d], kind: "port" as const },
      })),
      {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: SULINA_ROADS },
        properties: { name: "Sulina roads", kind: "roads" as const },
      },
    ],
  };
}
