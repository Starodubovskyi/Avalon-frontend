"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useDashboardStore } from "./store";
import type { Vessel as StoreVessel } from "./types";
import { useTheme } from "next-themes";

import VesselOverlay from "@/components/map/VesselOverlay";
import { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";
import type { VesselInfo } from "@/components/map/VesselInfoPanel";

const MIN_ZOOM = 3;
const DEFAULT_ZOOM = 4;
const SINGLE_VESSEL_ZOOM = 7;

export default function FleetMap() {
  const { vessels, searchQuery, filters } = useDashboardStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return vessels.filter((v) => {
      const qok =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.imo.includes(q) ||
        v.mmsi.includes(q) ||
        (v.nextPort || "").toLowerCase().includes(q);
      const sok = filters.status === "All" || v.status === filters.status;
      const tok = filters.type === "All" || v.type === filters.type;
      const rok = filters.region === "All" || v.region === filters.region;
      const rik = filters.risk === "All" || (v.risk || "Low") === filters.risk;
      return qok && sok && tok && rok && rik;
    });
  }, [vessels, searchQuery, filters]);

  const center = useMemo(() => {
    if (!filtered.length) return { lat: 20, lon: 20 };
    const lat = filtered.reduce((s, v) => s + v.lat, 0) / filtered.length;
    const lon = filtered.reduce((s, v) => s + v.lon, 0) / filtered.length;
    return { lat, lon };
  }, [filtered]);

  const tileUrl =
    resolvedTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttrib =
    resolvedTheme === "dark"
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between p-4">
        <div className="text-sm opacity-70">Live Fleet Map</div>
        <div className="text-xs opacity-60">{filtered.length} vessels</div>
      </div>

      {mounted ? (
        <MapContainer
          center={[center.lat, center.lon]}
          zoom={DEFAULT_ZOOM}
          minZoom={MIN_ZOOM}
          maxZoom={12}
          scrollWheelZoom
          worldCopyJump
          maxBounds={[[-85, -180], [85, 180]]}
          maxBoundsViscosity={0.9}
          className="w-full"
          style={{ height: "48vh", minHeight: 360 }}
        >
          <TileLayer attribution={tileAttrib} url={tileUrl} noWrap />

          <AutoFit
            points={filtered.map((v) => [v.lat, v.lon] as [number, number])}
            minZoom={MIN_ZOOM}
            singleZoom={SINGLE_VESSEL_ZOOM}
          />

          <VesselOverlayLeafletBridge vessels={filtered} />
        </MapContainer>
      ) : (
        <div className="h-[48vh] min-h-[360px] w-full bg-gray-100 dark:bg-white/5" />
      )}
    </div>
  );
}


function AutoFit({
  points,
  minZoom,
  singleZoom = 7,
}: {
  points: [number, number][];
  minZoom: number;
  singleZoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], singleZoom, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(points.map(([lat, lon]) => L.latLng(lat, lon)));
    map.fitBounds(bounds, { padding: [40, 40], animate: true });

    if (map.getZoom() < minZoom) map.setZoom(minZoom);
  }, [points, map, minZoom, singleZoom]);

  return null;
}


function VesselOverlayLeafletBridge({ vessels }: { vessels: StoreVessel[] }) {
  const map = useMap();
  const [adapter, setAdapter] = useState<LeafletAdapter | null>(null);

  useEffect(() => {
    const a = new LeafletAdapter(map);
    a.loadVessels(vessels.map(mapStoreVesselToOverlay));
    setAdapter(a);
    return () => {
      a.destroy();
    };
  }, [map]);

  useEffect(() => {
    if (!adapter) return;
    adapter.destroy();
    adapter.loadVessels(vessels.map(mapStoreVesselToOverlay));
  }, [vessels]);

  if (!adapter) return null;

  return (
    <VesselOverlay
      adapter={adapter}
      detailsHref={(id) => `/vessels/${id}`}
    />
  );
}

function mapStoreVesselToOverlay(v: StoreVessel): VesselInfo {
  const eta = v.etaIso ? new Date(v.etaIso) : new Date(Date.now() + 48 * 3600 * 1000);
  const atd = new Date(eta.getTime() - (72 + Math.floor(Math.random() * 96)) * 3600 * 1000);

  return {
    id: String(v.id),
    name: v.name,
    lat: v.lat,
    lon: v.lon,
    course: v.course ?? 0,
    type: v.type ?? "Vessel",
    flagEmoji: (v as any).flagEmoji ?? "🏳️",
    photoUrl:
      (v as any).photoUrl ??
      "https://images.unsplash.com/photo-1548502632-6d14d2b46b9f?q=80&w=1200&auto=format&fit=crop",
    departurePort: v.nextPort || "-",
    atd: atd.toISOString(),
    reportedEta: eta.toISOString(),
    status: v.status as any,
    speed: v.speed ?? 0,
    loadCondition: (v as any).loadCondition ?? "—",
    receivedAgo: "updated just now",
  };
}
