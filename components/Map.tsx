"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import VesselOverlay from "@/components/map/VesselOverlay";
import { MapboxAdapter } from "@/components/map/adapters/MapboxAdapter";
import type { VesselInfo } from "@/components/map/VesselInfoPanel";
import RightDock from "./map/right-dock/RightDock";
import { mockVesselsData } from "@/components/types/mockData1";

import { usePoints } from "./context/PointsContext";
import CreatePointForm from "@/components/map/CreatePointForm";
import PointPopup from "@/components/map/PointPopup";
import { getMapboxToken } from "@/lib/map/getMapboxToken";
import { useAuth } from "@/lib/auth/useAuth";
import type { CreateMapPointDto } from "@/lib/domain/map-point";
import {
  DEFAULT_KIND_VISIBILITY,
  type KindVisibility,
  type MapLayerKind,
} from "@/lib/domain/map-layer";
import { useMapKindLayers } from "@/components/map/layers/useMapKindLayers";

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const adapterRef = useRef<MapboxAdapter | null>(null);
  const isAddModeRef = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthed, loading: authLoading } = useAuth();

  const [adapter, setAdapter] = useState<MapboxAdapter | null>(null);
  const [currentBase, setCurrentBase] = useState<BaseName>("sat");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const allVessels = useMemo(() => mapMocksToVesselInfo(), []);
  const [count, setCount] = useState(allVessels.length);
  const [isMobile, setIsMobile] = useState(false);

  const { points, addPoint, toggleFavorite, deletePoint } = usePoints();

  const [isAddMode, setIsAddMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [tempCoords, setTempCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [projection, setProjection] = useState<"globe" | "mercator">("globe");
  const [kindVisibility, setKindVisibility] = useState<KindVisibility>(
    DEFAULT_KIND_VISIBILITY,
  );

  useMapKindLayers(adapter ? mapInstance.current : null, kindVisibility);

  useEffect(() => {
    isAddModeRef.current = isAddMode;
  }, [isAddMode]);

  useEffect(() => {
    adapterRef.current = adapter;
  }, [adapter]);

  useEffect(() => {
    if (searchParams.get("intent") !== "add-pin") return;
    if (authLoading) return;
    if (!isAuthed) {
      router.replace("/auth?next=/maps&intent=add-pin");
      return;
    }
    setIsAddMode(true);
  }, [searchParams, isAuthed, authLoading, router]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mapInstance.current) return;
    if (!mapContainer.current) return;

    let token: string;
    try {
      token = getMapboxToken();
    } catch (error: unknown) {
      setTokenError(
        error instanceof Error
          ? error.message
          : "NEXT_PUBLIC_MAPBOX_TOKEN is missing",
      );
      return;
    }

    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [10, 20],
        zoom: 1.5,
        projection: "globe",
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
        adapterRef.current = a;
        setAdapter(a);
        setCount(allVessels.length);

        a.onMapClick((lat, lon) => {
          if (!isAddModeRef.current) return;
          a.setTempMarker(lat, lon);
          setTempCoords({ lat, lng: lon });
          setIsCreating(true);
          setSelectedPointId(null);
          setPopupPos(null);
        });

        setTimeout(() => map.resize(), 200);
      });
    } catch (error: unknown) {
      setTokenError(
        error instanceof Error ? error.message : "Failed to initialize map",
      );
    }

    return () => {
      adapterRef.current?.destroy();
      adapterRef.current = null;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
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
  }, [adapter]);

  useEffect(() => {
    if (!adapter) return;

    adapter.renderCustomPoints(
      kindVisibility.person ? points : [],
      (id) => {
      const p = points.find((point) => point.id === id);
      if (p) {
        const screenPos = adapter.project(p.lat, p.lng);
        setPopupPos({ x: screenPos.x, y: screenPos.y });
        setSelectedPointId(id);
        setIsCreating(false);
        adapter.removeTempMarker();
      }
    });
  }, [adapter, points, kindVisibility.person]);

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
    const want: BaseName = saved ? saved : "sat";

    if (want !== currentBase) {
      adapter.setBasemap(want);
      setCurrentBase(want);
    }
  }, [adapter]);

  useEffect(() => {
    if (!adapter) return;
    if (kindVisibility.vessel) {
      adapter.loadVessels(allVessels);
    } else {
      adapter.setVessels([]);
    }
  }, [adapter, kindVisibility.vessel, allVessels]);

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

  const exitAddMode = () => {
    setIsAddMode(false);
    setIsCreating(false);
    setTempCoords(null);
    adapter?.removeTempMarker();
  };

  const handleAddPinClick = () => {
    if (!isAuthed) {
      router.push("/auth?next=/maps&intent=add-pin");
      return;
    }
    if (isAddMode) {
      exitAddMode();
      return;
    }
    setIsAddMode(true);
  };

  const handleSavePoint = (data: Omit<CreateMapPointDto, "lat" | "lng">) => {
    if (!tempCoords) return;
    addPoint({
      ...data,
      lat: tempCoords.lat,
      lng: tempCoords.lng,
    });
    exitAddMode();
  };

  const handleCancelCreate = () => {
    exitAddMode();
  };

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedPointId) || null,
    [points, selectedPointId],
  );

  return (
    <div className="relative h-full w-full min-h-0 bg-gray-900 overflow-hidden">
      <div
        ref={mapContainer}
        className="absolute inset-0 z-0 w-full h-full"
        style={{ outline: "none" }}
      />

      {tokenError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900 px-6 text-center">
          <p className="max-w-md text-sm text-red-200 sm:text-base">
            Map cannot start: {tokenError}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleAddPinClick}
        className={`absolute top-4 left-4 z-[1001] rounded-xl px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm border transition ${
          isAddMode
            ? "bg-blue-600 text-white border-blue-400"
            : "bg-black/60 text-white border-white/10 hover:bg-black/80"
        }`}
      >
        {isAddMode ? "Cancel pin" : "Add pin"}
      </button>

      {isAddMode && !isCreating && (
        <div className="absolute top-4 left-32 z-[1001] rounded-xl bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm border border-white/10">
          Click the map to drop a pin
        </div>
      )}

      {adapter && (
        <>
          <VesselOverlay
            adapter={adapter}
            detailsHref={(id) => `/vessels/${id}`}
          />

          <RightDock
            adapter={adapter}
            currentBasemap={currentBase}
            onBasemapChange={(style) => {
              adapter.setBasemap(style);
              setCurrentBase(style);
              localStorage.setItem(STORAGE_KEY, style);
            }}
            currentProjection={projection}
            onProjectionChange={(nextProj) => {
              const map = mapInstance.current;
              if (!map) return;

              if (nextProj === "globe") {
                map.setProjection("globe");

                map.flyTo({
                  center: [0, 20],
                  zoom: 1.5,
                  pitch: 45,
                  bearing: 0,
                  duration: 2500,
                  essential: true,
                });
              } else {
                map.setProjection("mercator");

                map.flyTo({
                  center: [0, 20],
                  zoom: 2.5,
                  pitch: 0,
                  bearing: 0,
                  duration: 2000,
                  essential: true,
                });
              }

              setProjection(nextProj);
            }}
            kindVisibility={kindVisibility}
            onKindVisibilityChange={(kind: MapLayerKind, on: boolean) => {
              setKindVisibility((prev) => ({ ...prev, [kind]: on }));
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
