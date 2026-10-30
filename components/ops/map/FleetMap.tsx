"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { type GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { DANUBE_VIEW, resolvePosition } from "@/lib/vessels/geo";
import type { VesselView } from "@/lib/vessels/types";
import { installShipIcons } from "./shipIcons";
import { placesGeoJson, vesselsToGeoJson } from "./fleetGeo";

const STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
const STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";
const SEAMARK_TILES = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";

interface FleetMapProps {
  vessels: VesselView[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showSeamarks: boolean;
}

function readToken(): string {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
}

function installLayers(map: mapboxgl.Map, dark: boolean) {
  installShipIcons(map, dark);
  const text = dark ? "#e2e8f0" : "#0f172a";
  const halo = dark ? "rgba(2,6,23,0.9)" : "rgba(255,255,255,0.95)";

  if (!map.getSource("seamarks")) {
    map.addSource("seamarks", { type: "raster", tiles: [SEAMARK_TILES], tileSize: 256, maxzoom: 18 });
    map.addLayer({ id: "seamarks", type: "raster", source: "seamarks", minzoom: 9 });
  }
  if (!map.getSource("places")) {
    map.addSource("places", { type: "geojson", data: placesGeoJson() });
    map.addLayer({
      id: "places-dot",
      type: "circle",
      source: "places",
      paint: {
        "circle-radius": 4,
        "circle-color": dark ? "#334155" : "#cbd5e1",
        "circle-stroke-width": 1.5,
        "circle-stroke-color": dark ? "#94a3b8" : "#475569",
      },
    });
    map.addLayer({
      id: "places-label",
      type: "symbol",
      source: "places",
      layout: {
        "text-field": ["get", "name"],
        "text-size": 11,
        "text-offset": [0, 1.1],
        "text-anchor": "top",
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
      },
      paint: { "text-color": dark ? "#94a3b8" : "#475569", "text-halo-color": halo, "text-halo-width": 1.2 },
    });
  }
  if (!map.getSource("vessels")) {
    map.addSource("vessels", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({
      id: "vessel-selected",
      type: "circle",
      source: "vessels",
      filter: ["==", ["get", "id"], ""],
      paint: {
        "circle-radius": 17,
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": 2.5,
        "circle-stroke-color": dark ? "#f8fafc" : "#0f172a",
      },
    });
    map.addLayer({
      id: "vessel-icons",
      type: "symbol",
      source: "vessels",
      layout: {
        "icon-image": ["get", "icon"],
        "icon-rotate": ["get", "rotation"],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "text-field": ["step", ["zoom"], "", 8, ["get", "name"]],
        "text-size": 11,
        "text-offset": [0, 1.5],
        "text-anchor": "top",
        "text-optional": true,
        "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
      },
      paint: {
        "icon-opacity": ["get", "opacity"],
        "text-color": text,
        "text-halo-color": halo,
        "text-halo-width": 1.4,
      },
    });
  }
}

export function FleetMap({ vessels, selectedId, onSelect, showSeamarks }: FleetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  /** bumps on every style load so data/filters are re-applied to the fresh style */
  const [styleVersion, setStyleVersion] = useState(0);
  const ready = styleVersion > 0;
  const [failed, setFailed] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const darkRef = useRef(dark);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const token = readToken();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!token) {
      setFailed("Map token is not configured (NEXT_PUBLIC_MAPBOX_TOKEN).");
      return;
    }
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: darkRef.current ? STYLE_DARK : STYLE_LIGHT,
      center: DANUBE_VIEW.center,
      zoom: DANUBE_VIEW.zoom,
      attributionControl: true,
      cooperativeGestures: false,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "nautical" }), "bottom-right");

    map.on("style.load", () => {
      installLayers(map, darkRef.current);
      setStyleVersion((n) => n + 1);
    });
    map.on("error", (e) => {
      const status = (e.error as { status?: number } | undefined)?.status;
      if (status === 401 || status === 403) setFailed("Map token was rejected by Mapbox. Check NEXT_PUBLIC_MAPBOX_TOKEN.");
    });
    map.on("click", "vessel-icons", (e) => {
      const id = e.features?.[0]?.properties?.id;
      if (typeof id === "string") onSelectRef.current(id);
    });
    map.on("click", (e) => {
      if (!map.getLayer("vessel-icons")) return;
      const hits = map.queryRenderedFeatures(e.point, { layers: ["vessel-icons"] });
      if (!hits.length) onSelectRef.current(null);
    });
    map.on("mouseenter", "vessel-icons", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "vessel-icons", () => (map.getCanvas().style.cursor = ""));

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // theme switch → new basemap; layers are re-installed on style.load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || darkRef.current === dark) return;
    darkRef.current = dark;
    map.setStyle(dark ? STYLE_DARK : STYLE_LIGHT);
  }, [dark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("vessels") as GeoJSONSource | undefined)?.setData(vesselsToGeoJson(vessels));
  }, [vessels, ready, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("vessel-selected")) return;
    map.setFilter("vessel-selected", ["==", ["get", "id"], selectedId ?? ""]);
    const v = vessels.find((x) => x.id === selectedId);
    if (v) {
      const { lngLat } = resolvePosition(v);
      map.flyTo({ center: lngLat, zoom: Math.max(map.getZoom(), 9), duration: 900, essential: true });
    }
    // fly only when the selection changes, not on every data refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, ready, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("seamarks")) return;
    map.setLayoutProperty("seamarks", "visibility", showSeamarks ? "visible" : "none");
  }, [showSeamarks, ready, styleVersion]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-6 text-center text-sm text-muted-foreground">
          {failed}
        </div>
      ) : null}
    </div>
  );
}
