"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import VesselOverlay from "@/components/map/VesselOverlay";
import { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";
import type { VesselInfo } from "@/components/map/VesselInfoPanel";
import RightDock from "./map/right-dock/RightDock";
import { mockVesselsData } from "@/components/types/mockData1";

type LL = { lat: number; lon: number };
type BaseName = "light" | "dark" | "osm" | "sat";

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
  const deg = (θ * 180) / Math.PI;
  return (deg + 360) % 360;
}

function mapMocksToVesselInfo(): VesselInfo[] {
  return mockVesselsData.map((v): VesselInfo => {
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

const STORAGE_KEY = "basemap_v1";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [adapter, setAdapter] = useState<LeafletAdapter | null>(null);
  const [currentBase, setCurrentBase] = useState<BaseName>("light");
  const { resolvedTheme } = useTheme();

  const allVessels = useMemo(() => mapMocksToVesselInfo(), []);
  const [count, setCount] = useState(allVessels.length);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current as any;
    if (container._leaflet_id) container._leaflet_id = null;

    const map = L.map(container, {
      center: [20, 10],
      zoom: 3,
      minZoom: 2,
      maxZoom: 14,
      zoomControl: !isMobile,
      scrollWheelZoom: !isMobile,
      touchZoom: true,
      dragging: true,
      worldCopyJump: true,
      preferCanvas: true,
      inertia: true,
      maxBounds: [
        [-85, -180],
        [85, 180],
      ],
      maxBoundsViscosity: 0.8,
    });

    if (isMobile) {
      L.control
        .zoom({ position: "bottomright" })
        // @ts-ignore
        .addTo(map);
    }

    const a = new LeafletAdapter(map);
    a.setBasemap("light");
    a.loadVessels(allVessels);
    setAdapter(a);
    setCount(allVessels.length);

    const bounds = L.latLngBounds(
      allVessels.map((v) => L.latLng(v.lat, v.lon))
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        paddingTopLeft: isMobile ? [16, 32] : [40, 80],
        paddingBottomRight: isMobile ? [16, 64] : [40, 40],
        maxZoom: 8,
      });
    }

    const invalidate = () => setTimeout(() => map.invalidateSize(), 0);
    invalidate();
    window.addEventListener("orientationchange", invalidate);
    window.addEventListener("resize", invalidate);

    return () => {
      window.removeEventListener("orientationchange", invalidate);
      window.removeEventListener("resize", invalidate);
      a.destroy();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, allVessels]);

  useEffect(() => {
    if (!adapter) return;

    const saved = (
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as BaseName | null)
        : null
    ) as BaseName | null;

    const locked = saved === "osm" || saved === "sat";
    const want: BaseName = locked
      ? (saved as BaseName)
      : resolvedTheme === "dark"
      ? "dark"
      : "light";

    if (want !== currentBase) {
      adapter.setBasemap(want);
      setCurrentBase(want);
    }
  }, [adapter, resolvedTheme, currentBase]);

  useEffect(() => {
    if (!adapter) return;
    const onChangeVisible = () => {
      setCount(
        adapter.getVisibleCount ? adapter.getVisibleCount() : allVessels.length
      );
    };
    // @ts-ignore — если адаптер эмитит события
    adapter.on?.("visible:change", onChangeVisible);
    return () => {
      // @ts-ignore
      adapter.off?.("visible:change", onChangeVisible);
    };
  }, [adapter, allVessels.length]);

  return (
    <div className="relative w-full h-[100svh] sm:h-screen">
      <div
        ref={mapRef}
        className="absolute inset-0 z-0 bg-white dark:bg-black"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      />
      {adapter && (
        <>
          <VesselOverlay
            adapter={adapter}
            detailsHref={(id) => `/vessels/${id}`}
          />
          <RightDock adapter={adapter} />
        </>
      )}

      <div className="absolute right-2 bottom-[calc(env(safe-area-inset-bottom)+8px)] z-[1200] rounded-md bg-black/60 px-2 py-1 text-[10px] sm:text-xs text-white">
        {count} visible
      </div>
    </div>
  );
}
