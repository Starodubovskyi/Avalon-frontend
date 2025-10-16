"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLiquidStore } from "./state";

export function LiquidMap() {
  const router = useRouter();
  const { filtered, selectedId, setSelectedId, setViewport, openPreview } =
    useLiquidStore();

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());

  const points = useMemo(
    () =>
      (filtered || [])
        .map((v) =>
          Number.isFinite(v.lat) && Number.isFinite(v.lng)
            ? {
                id: String(v.id),
                name: String(v.name ?? "—"),
                lat: Number(v.lat),
                lng: Number(v.lng),
                dest: String(v.destinationPort ?? v.reportedDestination ?? "—"),
              }
            : null
        )
        .filter(Boolean) as {
        id: string;
        name: string;
        lat: number;
        lng: number;
        dest: string;
      }[],
    [filtered]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
      worldCopyJump: true,
    }).setView([30, 10], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setViewport({
      center: [map.getCenter().lat, map.getCenter().lng],
      zoom: map.getZoom(),
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    points.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 5,
        color: "#0891b2",
        weight: 2,
        fillColor: "#22d3ee",
        fillOpacity: 0.85,
      })
        .addTo(map)
        .on("click", () => {
          setSelectedId(p.id);
          openPreview(p.id);
          const rowEl = document.querySelector<HTMLElement>(
            `[data-row-id="${p.id}"]`
          );
          rowEl?.scrollIntoView({ block: "center", behavior: "smooth" });
        })
        .on("dblclick", () => router.push(`/vessels/${p.id}`))
        .bindTooltip(`${p.name} → ${p.dest}`, { direction: "top" });

      markersRef.current.set(p.id, marker);
    });

    if (points.length) {
      const bounds = L.latLngBounds(
        points.map((p) => [p.lat, p.lng] as L.LatLngTuple)
      );
      map.fitBounds(bounds.pad(0.2), { animate: true });
    }
  }, [points, router, setSelectedId, openPreview]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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

    if (selectedId) {
      const p = points.find((x) => x.id === selectedId);
      if (p) {
        map.flyTo([p.lat, p.lng], Math.max(7, map.getZoom()), {
          duration: 0.7,
        });
        setViewport({
          center: [p.lat, p.lng],
          zoom: Math.max(7, map.getZoom()),
        });
      }
    }
  }, [selectedId, points, setViewport]);

  return (
    <div className="h-[380px] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div ref={containerRef} className="h-full w-full rounded-2xl" />
    </div>
  );
}
