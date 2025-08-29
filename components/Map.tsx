"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import VesselOverlay from "@/components/map/VesselOverlay";
import { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";
import type { VesselInfo } from "@/components/map/VesselInfoPanel";
import RightDock from "./map/right-dock/RightDock";

import { mockVesselsData } from "@/components/types/mockData1";

type LL = { lat: number; lon: number };

const PORT_COORDS: Record<string, LL> = {
  rotterdam: { lat: 51.95, lon: 4.14 },
  "port of rotterdam": { lat: 51.95, lon: 4.14 },
  southampton: { lat: 50.9, lon: -1.4 },
  "port of southampton": { lat: 50.9, lon: -1.4 },
  "new york": { lat: 40.7, lon: -74.0 },
  suez: { lat: 29.96, lon: 32.55 },
  hamburg: { lat: 53.54, lon: 9.98 },
  "port of hamburg": { lat: 53.54, lon: 9.98 },
  "tanger-med": { lat: 35.89, lon: -5.5 },
  tangermed: { lat: 35.89, lon: -5.5 },
  "ras tanura": { lat: 26.64, lon: 50.16 },
  singapore: { lat: 1.26, lon: 103.85 },
};

const lower = (s?: string) => (s || "").toLowerCase().trim();

function coordsFor(place?: string): LL | null {
  const key = lower(place);
  if (!key) return null;
  if (PORT_COORDS[key]) return PORT_COORDS[key];
  const k2 = key.replace(/^port of\s+/i, "");
  return PORT_COORDS[k2] || null;
}

function toFlagEmoji(country?: string): string {
  if (!country) return "";
  if (/[\uD83C][\uDDE6-\uDDFF]/.test(country)) return country;

  const m: Record<string, string> = {
    panama: "🇵🇦",
    "united kingdom": "🇬🇧",
    belgium: "🇧🇪",
  };
  return m[lower(country)] || country;
}

function toBearing(a: LL, b: LL): number {
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δλ = ((b.lon - a.lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (θ * 180) / Math.PI + (360 % 360);
}

function mapMocksToVesselInfo(): VesselInfo[] {
  return mockVesselsData.map((v, i): VesselInfo => {
    const from = coordsFor(v.currentPort) || { lat: 0, lon: 0 };
    const to = coordsFor(v.destinationPort || v.reportedDestination) || {
      lat: from.lat,
      lon: from.lon + 1,
    };
    const course = toBearing(from, to) || 90;

    return {
      id: v.id,
      name: v.name,
      lat: from.lat,
      lon: from.lon,
      course,
      type: v.vesselType || "Vessel",
      flagEmoji: toFlagEmoji(v.flag),
      photoUrl: v.photoUrl,
      departurePort: v.currentPort || "—",
      atd: "",
      reportedEta: v.reportedETA || "",
      status: "Underway Using Engine",
      speed: 14,
      loadCondition: "Laden",
      receivedAgo: "2 minutes ago",
    };
  });
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [adapter, setAdapter] = useState<LeafletAdapter | null>(null);

  const [allVessels] = useState<VesselInfo[]>(() => mapMocksToVesselInfo());
  const [count, setCount] = useState(allVessels.length);

  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current as any;
    if (container._leaflet_id) container._leaflet_id = null;

    const map = L.map(container, {
      center: [20, 10],
      zoom: 3,
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });

    const a = new LeafletAdapter(map);
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem("basemap_v1") as any)) ||
      "dark";
    a.setBasemap(
      saved === "light" || saved === "osm" || saved === "sat" ? saved : "dark"
    );

    a.loadVessels(allVessels);
    setAdapter(a);
    setCount(allVessels.length);

    return () => {
      a.destroy();
      map.remove();
    };
  }, [allVessels]);

  return (
    <div className="relative h-screen w-full">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      {adapter && (
        <>
          <VesselOverlay
            adapter={adapter}
            detailsHref={(id) => `/vessels/${id}`}
          />
          <RightDock adapter={adapter} />
        </>
      )}

      <div className="absolute right-2 bottom-2 z-[1200] rounded-md bg-black/60 px-2 py-1 text-xs text-white">
        {count} visible
      </div>
    </div>
  );
}
