"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import type { PortLite } from "@/components/lineup/ports/mockPorts";
import type { VesselCall } from "./mockPortCalls";

type Props = {
  port: PortLite;
  calls: VesselCall[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export default function DetailMap({
  port,
  calls,
  selectedId,
  onSelect,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());

  const selected = useMemo(
    () => calls.find((c) => c.id === selectedId),
    [calls, selectedId]
  );

  const colorByStatus = (s: VesselCall["status"]) =>
    s === "In Port"
      ? ["#059669", "#34d399"]
      : s === "At Anchor"
      ? ["#b45309", "#f59e0b"]
      : s === "Inbound"
      ? ["#0369a1", "#38bdf8"]
      : ["#334155", "#94a3b8"];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
      worldCopyJump: true,
    }).setView([port.lat, port.lng], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    calls.forEach((v) => {
      const [stroke, fill] = colorByStatus(v.status);
      const m = L.circleMarker([v.lat, v.lng], {
        radius: 6,
        color: stroke,
        weight: 2,
        fillColor: fill,
        fillOpacity: 0.9,
      })
        .addTo(map)
        .on("click", () => onSelect?.(v.id))
        .bindTooltip(
          `${v.name} (${v.vesselType}) • ${v.status}\nCargo: ${v.cargo.type}${
            v.cargo.grade ? " " + v.cargo.grade : ""
          }${v.cargo.qty ? " • " + v.cargo.qty + (v.cargo.unit ?? "") : ""}\n${
            v.route.origin
          } → ${v.route.dest}${
            v.eta ? " • ETA " + new Date(v.eta).toLocaleString() : ""
          }`,
          { direction: "top" }
        );
      markersRef.current.set(v.id, m);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [calls, port.lat, port.lng, onSelect]);

  useEffect(() => {
    markersRef.current.forEach((m, id) => {
      const v = calls.find((x) => x.id === id);
      if (!v) return;
      const active = id === selectedId;
      const [stroke, fill] = colorByStatus(v.status);
      m.setStyle({
        radius: active ? 8 : 6,
        color: active ? stroke : stroke,
        weight: active ? 3 : 2,
        fillColor: active ? fill : fill,
      });
      if (active) m.bringToFront();
    });

    if (selected && mapRef.current) {
      const zoom =
        selected.status === "Inbound" || selected.status === "Outbound"
          ? 8
          : 12;
      mapRef.current.flyTo([selected.lat, selected.lng], zoom, {
        duration: 0.7,
      });
    }
  }, [selectedId, selected, calls]);

  return (
    <div className="h-96 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <div ref={containerRef} className="h-full w-full rounded-xl" />
    </div>
  );
}
