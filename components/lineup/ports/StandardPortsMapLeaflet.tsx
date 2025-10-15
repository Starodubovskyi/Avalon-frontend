"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PortLite } from "./mockPorts";
import { usePortsStore } from "./state";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  ports: PortLite[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export default function StandardPortsMapLeaflet({
  ports,
  selectedId,
  onSelect,
}: Props) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const { radius, setRadius } = usePortsStore();

  const selectedPort = useMemo(
    () => ports.find((p) => p.id === selectedId),
    [ports, selectedId]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
      worldCopyJump: true,
    }).setView([30, 10], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    ports.forEach((p) => {
      const m = L.circleMarker([p.lat, p.lng], {
        radius: 5,
        color: "#0891b2",
        weight: 2,
        fillColor: "#22d3ee",
        fillOpacity: 0.85,
      })
        .addTo(map)
        .on("click", () => onSelect?.(p.id))
        .on("dblclick", () => router.push(`/lineup/ports/${p.id}`))
        .bindTooltip(`${p.name} (${p.unlocode})`, { direction: "top" });

      markersRef.current.set(p.id, m);
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      if ((e.originalEvent as MouseEvent).shiftKey) {
        setRadius({
          center: { lat: e.latlng.lat, lng: e.latlng.lng },
          km: radius?.km ?? 200,
        });
      }
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [ports, onSelect, router, radius, setRadius]);

  useEffect(() => {
    markersRef.current.forEach((m, id) => {
      const active = id === selectedId;
      m.setStyle({
        radius: active ? 8 : 5,
        color: active ? "#059669" : "#0891b2",
        weight: active ? 3 : 2,
        fillColor: active ? "#34d399" : "#22d3ee",
      });
      if (active) m.bringToFront();
    });

    if (selectedPort && mapRef.current) {
      mapRef.current.flyTo(
        [selectedPort.lat, selectedPort.lng],
        selectedPort.zoom ?? 5,
        { duration: 0.7 }
      );
    }
  }, [selectedId, selectedPort]);

  return (
    <div className="h-56 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <div ref={containerRef} className="h-full w-full rounded-xl" />
    </div>
  );
}
