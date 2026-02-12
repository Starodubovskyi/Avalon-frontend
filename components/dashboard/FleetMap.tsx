"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useDashboardStore } from "./store";
import type { Vessel as StoreVessel } from "./types";
import { useTheme } from "next-themes";
import { IconShip } from "@tabler/icons-react";

import VesselOverlay from "@/components/map/VesselOverlay";
import { MapboxAdapter } from "@/components/map/adapters/MapboxAdapter"; // Используем Mapbox адаптер
import type { VesselInfo } from "@/components/map/VesselInfoPanel";

// Не забудьте указать токен (или вынести его в env)
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmFiYXN0ZXIiLCJhIjoiY21rcXlxcHFjMGIxbDNpczRjaXZ0bjU5ZCJ9.hM2_TSbf9hKdvuVYSWXsEQ";

export default function FleetMap() {
  const { vessels, searchQuery, filters } = useDashboardStore();
  const { resolvedTheme } = useTheme();

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [adapter, setAdapter] = useState<MapboxAdapter | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // --- 1. Фильтрация данных (осталась без изменений) ---
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

  // --- 2. Инициализация карты ---
  useEffect(() => {
    if (!mounted || !mapContainer.current || mapInstance.current) return;

    const style =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [20, 20], // [lon, lat]
      zoom: 1.5,
      projection: "mercator" as any, // Для дэшборда часто удобнее 2D, но можно и 'globe'
      attributionControl: false,
    });

    mapInstance.current = map;

    map.on("load", () => {
      const a = new MapboxAdapter(map);
      setAdapter(a);
    });

    return () => {
      if (adapter) adapter.destroy(); // Гипотетический метод очистки
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // --- 3. Смена темы (Dark/Light) ---
  useEffect(() => {
    if (!mapInstance.current) return;
    const style =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

    // Проверяем, чтобы не перезагружать тот же стиль
    // (Mapbox не дает простого метода узнать URL текущего стиля, но можно оптимизировать)
    mapInstance.current.setStyle(style);

    // При смене стиля нужно восстановить слои адаптера,
    // если адаптер зависит от слоев карты.
    // Обычно MapboxAdapter должен слушать событие 'style.load' внутри себя.
  }, [resolvedTheme]);

  // --- 4. Обновление судов и Авто-зум (Fit Bounds) ---
  useEffect(() => {
    if (!adapter || !mapInstance.current) return;

    // Преобразуем данные
    const mappedVessels = filtered.map(mapStoreVesselToOverlay);

    // Загружаем в адаптер
    adapter.loadVessels(mappedVessels);

    // Логика AutoFit
    if (mappedVessels.length === 0) return;

    if (mappedVessels.length === 1) {
      // Одно судно
      const v = mappedVessels[0];
      mapInstance.current.flyTo({
        center: [v.lon, v.lat],
        zoom: 7,
        essential: true,
      });
    } else {
      // Много судов - вычисляем границы
      const bounds = new mapboxgl.LngLatBounds();
      mappedVessels.forEach((v) => {
        bounds.extend([v.lon, v.lat]);
      });

      mapInstance.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10,
        animate: true,
        duration: 1000,
      });
    }
  }, [adapter, filtered]);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <IconShip size={20} />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            Live Fleet Map
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          {filtered.length} active vessels
        </div>
      </div>

      {/* Map Content */}
      <div className="relative h-[48vh] min-h-[400px] w-full bg-zinc-50 dark:bg-zinc-900">
        <div
          ref={mapContainer}
          className="absolute inset-0 h-full w-full outline-none"
        />

        {!mounted && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400 bg-zinc-50 dark:bg-zinc-900">
            Initializing map engine...
          </div>
        )}

        {/* Подключаем Overlay, если он нужен для всплывающих окон/панелей */}
        {adapter && (
          <VesselOverlay
            adapter={adapter}
            detailsHref={(id) => `/vessels/${id}`}
          />
        )}
      </div>
    </div>
  );
}

// --- Helper Function ---
function mapStoreVesselToOverlay(v: StoreVessel): VesselInfo {
  const eta = v.etaIso
    ? new Date(v.etaIso)
    : new Date(Date.now() + 48 * 3600 * 1000);
  const atd = new Date(
    eta.getTime() - (72 + Math.floor(Math.random() * 96)) * 3600 * 1000,
  );

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
