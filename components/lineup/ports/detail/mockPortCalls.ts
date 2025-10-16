import { PORTS, type PortLite } from "@/components/lineup/ports/mockPorts";
import { mockVesselsData } from "./externalVesselsMock";

export type VesselCall = {
  id: string;
  name: string;
  imo: number | string;
  mmsi?: number;
  flag: string;
  vesselType:
    | "Tanker"
    | "Bulk"
    | "Container"
    | "General"
    | "LNG"
    | "LPG"
    | "Ro-Ro"
    | "Passenger";
  status: "In Port" | "At Anchor" | "Inbound" | "Outbound";
  cargo: {
    type:
      | "Crude"
      | "Chemicals"
      | "Agri"
      | "Fertilizers"
      | "Liquid"
      | "Containers"
      | "Vehicles"
      | "Passengers"
      | "LNG"
      | "Bulk";
    grade?: string;
    qty?: number;
    unit?: "t" | "m3" | "teu" | "pax";
  };
  route: { origin: string; dest: string };
  operation?: "Load" | "Discharge" | "Transit";
  zone?: "Port" | "Anchorage" | "Approach";
  berth?: string;
  queue?: number;

  eta?: string;
  etd?: string;
  etaConfH?: number;

  loa?: number;
  beam?: number;
  dwt?: number;
  draft?: { current?: number; max?: number };

  speed?: number;
  course?: number;
  lat: number;
  lng: number;

  timeInPortH?: number;
  waitingH?: number;

  source?: "AIS" | "Manual" | "Broker";
  updatedAt: string;
};

const now = new Date();
const H = (h: number) =>
  new Date(now.getTime() + h * 3600 * 1000).toISOString();

const base: Record<string, VesselCall[]> = {};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/port of\s+/g, "")
    .replace(/[\u0000-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007f]+/g, "")
    .trim();

function cargoByVesselType(vesselType: string): VesselCall["cargo"]["type"] {
  const t = vesselType.toLowerCase();
  if (t.includes("container")) return "Containers";
  if (t.includes("crude")) return "Crude";
  if (t.includes("lng")) return "LNG";
  if (t.includes("lpg")) return "Liquid";
  if (t.includes("bulk")) return "Bulk";
  if (t.includes("ro-ro") || t.includes("roro")) return "Vehicles";
  if (t.includes("passenger") || t.includes("cruise")) return "Passengers";
  return "Liquid";
}

function mapStatusForPort(pv: any, port: PortLite): VesselCall["status"] {
  const dest = norm(pv.reportedDestination || pv.destinationPort || "");
  const current = norm(pv.currentPort || "");
  const pname = norm(port.name);

  if (current && current.includes(pname)) return "In Port";
  if (dest && dest.includes(pname)) return "Inbound";
  return "Outbound";
}

function offsetLatLng(port: PortLite, seed: string) {
  const hash = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  const dLat = ((hash % 7) - 3) * 0.01;
  const dLng = ((hash % 11) - 5) * 0.015;
  return { lat: port.lat + dLat, lng: port.lng + dLng };
}

function mapExternalToCalls(portId: string): VesselCall[] {
  const port = PORTS.find((p) => p.id === portId);
  if (!port) return [];

  const pname = port.name.toLowerCase();

  return mockVesselsData
    .filter((v) => {
      const dest = (
        v.reportedDestination ||
        v.destinationPort ||
        ""
      ).toLowerCase();
      const current = (v.currentPort || "").toLowerCase();
      return dest.includes(pname) || current.includes(pname);
    })
    .map((v) => {
      const cargoType = cargoByVesselType(v.vesselType || "");
      const status = mapStatusForPort(v, port);
      const { lat, lng } = offsetLatLng(port, v.id);

      const fallbackUnit =
        cargoType === "Containers"
          ? "teu"
          : cargoType === "Passengers"
          ? "pax"
          : "t";

      const cargo = (v as any).cargo ?? {
        type: cargoType,
        qty: (v as any).cargo?.qty ?? undefined,
        unit: (v as any).cargo?.unit ?? fallbackUnit,
        grade: (v as any).cargo?.grade ?? undefined,
      };

      return {
        id: v.id,
        name: v.name,
        imo: v.imo,
        mmsi: (v as any).mmsi ?? undefined,
        flag: v.flag,
        vesselType: /container/i.test(v.vesselType)
          ? "Container"
          : /bulk/i.test(v.vesselType)
          ? "Bulk"
          : /passenger/i.test(v.vesselType)
          ? "Passenger"
          : /ro-?ro/i.test(v.vesselType)
          ? "Ro-Ro"
          : /lng/i.test(v.vesselType)
          ? "LNG"
          : /lpg/i.test(v.vesselType)
          ? "LPG"
          : /tanker|crude/i.test(v.vesselType)
          ? "Tanker"
          : "General",

        status,
        cargo,
        operation:
          (v as any).operation ??
          (status === "Inbound"
            ? "Discharge"
            : status === "In Port"
            ? "Load"
            : "Transit"),
        route: {
          origin: v.currentPort || "—",
          dest: v.destinationPort || v.reportedDestination || "—",
        },

        eta: v.reportedETA ? new Date(v.reportedETA).toISOString() : undefined,
        etd: (v as any).etd ?? undefined,
        etaConfH: (v as any).etaConfH ?? 2,

        lat,
        lng,

        loa: (v as any).loa ?? undefined,
        beam: (v as any).beam ?? undefined,
        dwt: (v as any).dwt ?? undefined,
        draft: (v as any).draft ?? undefined,
        speed: (v as any).speed ?? undefined,
        course: (v as any).course ?? undefined,

        timeInPortH: (v as any).timeInPortH ?? undefined,
        waitingH: (v as any).waitingH ?? (status === "At Anchor" ? 6 : 0),

        zone:
          (v as any).zone ??
          (status === "In Port"
            ? "Port"
            : status === "At Anchor"
            ? "Anchorage"
            : "Approach"),
        berth: (v as any).berth ?? undefined,
        queue: (v as any).queue ?? undefined,

        source: "Manual",
        updatedAt: H(-0.2),
      } as VesselCall;
    });
}

export function getPortCallsMock(portId: string): VesselCall[] {
  const extra = mapExternalToCalls(portId);
  const fromBase = base[portId] ?? [];
  return [...fromBase, ...extra];
}
