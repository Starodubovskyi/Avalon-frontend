"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import VesselOverlay from "@/components/map/VesselOverlay";
import { MapboxAdapter } from "@/components/map/adapters/MapboxAdapter";
import type { VesselInfo } from "@/components/map/VesselInfoPanel";
import RightDock from "./map/right-dock/RightDock";
import { mockVesselsData } from "@/components/types/mockData1";

// --- НОВЫЕ ИМПОРТЫ ---
import { usePoints } from "./context/PointsContext";
import CreatePointForm from "@/components/map/CreatePointForm";
import PointPopup from "@/components/map/PointPopup";
// ---------------------

mapboxgl.accessToken =
  "pk.eyJ1IjoiYmFiYXN0ZXIiLCJhIjoiY21rcXlxcHFjMGIxbDNpczRjaXZ0bjU5ZCJ9.hM2_TSbf9hKdvuVYSWXsEQ";

type LL = { lat: number; lon: number };
type BaseName = "light" | "dark" | "osm" | "sat";

// --- Вспомогательные данные и функции ---
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const searchParams = useSearchParams();

  const [adapter, setAdapter] = useState<MapboxAdapter | null>(null);
  const [currentBase, setCurrentBase] = useState<BaseName>("sat");
  const { resolvedTheme } = useTheme();

  const allVessels = useMemo(() => mapMocksToVesselInfo(), []);
  const [count, setCount] = useState(allVessels.length);
  const [isMobile, setIsMobile] = useState(false);

  const { points, addPoint, toggleFavorite, deletePoint } = usePoints();

  const [isCreating, setIsCreating] = useState(false);
  const [tempCoords, setTempCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mapInstance.current) return;
    if (!mapContainer.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [10, 20],
        zoom: 1.5,
        projection: "globe" as any,
      });

      mapInstance.current = map;

      if (!isMobile) {
        map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      }

      map.on("style.load", () => {
        map.setFog({
          color: "rgb(186, 210, 235)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.02,
          "space-color": "rgb(11, 11, 25)",
          "star-intensity": 0.6,
        });
      });

      map.once("load", () => {
        const a = new MapboxAdapter(map);
        a.loadVessels(allVessels);
        setAdapter(a);
        setCount(allVessels.length);

        a.onMapClick((lat, lon) => {
          a.setTempMarker(lat, lon);
          setTempCoords({ lat, lng: lon });
          setIsCreating(true);
          setSelectedPointId(null);
          setPopupPos(null);
        });

        setTimeout(() => map.resize(), 200);
      });

      map.on("error", (e) => console.error("Mapbox error:", e));
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (adapter) adapter.destroy();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapInstance.current) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.resize();
        }
      }, 100);
    });

    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [mapInstance.current]);

  useEffect(() => {
    if (!adapter) return;

    adapter.renderCustomPoints(points, (id) => {
      const p = points.find((point) => point.id === id);
      if (p) {
        const screenPos = adapter.project(p.lat, p.lng);
        setPopupPos({ x: screenPos.x, y: screenPos.y });
        setSelectedPointId(id);
        setIsCreating(false);
        adapter.removeTempMarker();
      }
    });
  }, [adapter, points]);

  // --- ФОКУСИРОВКА ИЗ URL (View on Map) ---
  useEffect(() => {
    if (!adapter || !mapInstance.current || points.length === 0) return;

    const focusId = searchParams.get("focus");
    if (focusId) {
      const pointToFocus = points.find((p) => p.id === focusId);

      if (pointToFocus) {
        mapInstance.current.flyTo({
          center: [pointToFocus.lng, pointToFocus.lat],
          zoom: 6,
          essential: true,
          speed: 1.5,
        });

        setTimeout(() => {
          const screenPos = adapter.project(pointToFocus.lat, pointToFocus.lng);
          setPopupPos({ x: screenPos.x, y: screenPos.y });
          setSelectedPointId(focusId);
        }, 800);
      }
    }
  }, [adapter, points, searchParams]);

  useEffect(() => {
    if (!adapter || !selectedPointId) return;

    const p = points.find((point) => point.id === selectedPointId);
    if (!p) return;

    const updatePosition = () => {
      const screenPos = adapter.project(p.lat, p.lng);
      setPopupPos({ x: screenPos.x, y: screenPos.y });
    };

    const unsubscribe = adapter.onMove(updatePosition);
    updatePosition();

    return () => unsubscribe();
  }, [adapter, selectedPointId, points]);

  useEffect(() => {
    if (!adapter) return;
    const saved =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as BaseName | null)
        : null;
    const want: BaseName = saved ? (saved as BaseName) : "sat";

    if (want !== currentBase) {
      adapter.setBasemap(want);
      setCurrentBase(want);
    }
  }, [adapter]);

  useEffect(() => {
    if (!adapter) return;
    const onChangeVisible = () => {
      setCount(
        adapter.getVisibleCount ? adapter.getVisibleCount() : allVessels.length,
      );
    };
    adapter.on("visible:change", onChangeVisible);
    return () => adapter.off("visible:change", onChangeVisible);
  }, [adapter, allVessels.length]);

  const handleSavePoint = (data: any) => {
    if (tempCoords) {
      addPoint({
        ...data,
        lat: tempCoords.lat,
        lng: tempCoords.lng,
      });
      setIsCreating(false);
      setTempCoords(null);
      adapter?.removeTempMarker();
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setTempCoords(null);
    adapter?.removeTempMarker();
  };

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedPointId) || null,
    [points, selectedPointId],
  );

  return (
    <div className="relative w-full h-[100svh] sm:h-screen bg-gray-900 overflow-hidden">
      <div
        ref={mapContainer}
        className="absolute inset-0 z-0 w-full h-full"
        style={{ outline: "none" }}
      />

      {adapter && (
        <>
          <VesselOverlay
            adapter={adapter as any}
            detailsHref={(id) => `/vessels/${id}`}
          />
          <RightDock
            adapter={adapter as any}
            currentBasemap={currentBase}
            onBasemapChange={(style) => {
              adapter.setBasemap(style);
              setCurrentBase(style);
              localStorage.setItem(STORAGE_KEY, style);
            }}
          />
        </>
      )}

      {isCreating && tempCoords && (
        <CreatePointForm
          lat={tempCoords.lat}
          lng={tempCoords.lng}
          onSave={handleSavePoint}
          onCancel={handleCancelCreate}
        />
      )}

      {selectedPoint && popupPos && (
        <PointPopup
          point={selectedPoint}
          position={popupPos}
          onClose={() => setSelectedPointId(null)}
          onToggleFavorite={toggleFavorite}
          onDelete={(id) => {
            deletePoint(id);
            setSelectedPointId(null);
          }}
        />
      )}

      <div className="absolute right-2 bottom-[calc(env(safe-area-inset-bottom)+30px)] sm:bottom-[30px] z-[10] rounded-md bg-black/60 px-2 py-1 text-[10px] sm:text-xs text-white backdrop-blur-sm border border-white/10">
        {count} visible
      </div>
    </div>
  );
}
