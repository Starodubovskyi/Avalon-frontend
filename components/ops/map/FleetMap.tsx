"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { type GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { DANUBE_VIEW, resolvePosition } from "@/lib/vessels/geo";
import type { VesselView } from "@/lib/vessels/types";
import type { PointKind, TeamPoint } from "@/lib/points/team-points";
import { draftGeoJson, pointsToGeoJson, vesselsToGeoJson } from "./fleetGeo";
import { STYLE_URL, applyBasemapTheme, installLayers, restyleLabels } from "./mapLayers";

export interface LayerVisibility {
  vessels: boolean;
  seamarks: boolean;
  kinds: Record<PointKind, boolean>;
}

interface FleetMapProps {
  vessels: VesselView[];
  points: TeamPoint[];
  selectedVesselId: string | null;
  selectedPointId: string | null;
  onSelectVessel: (id: string | null) => void;
  onSelectPoint: (id: string | null) => void;
  layers: LayerVisibility;
  /** while true a map click places a new point instead of selecting */
  picking: boolean;
  draft: [number, number] | null;
  onPick: (lngLat: [number, number]) => void;
}

const CLICKABLE = ["vessel-icons", "point-icons"];

export function FleetMap(props: FleetMapProps) {
  const { vessels, points, selectedVesselId, selectedPointId, layers, picking, draft } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  /** bumps on every style load so data/filters are re-applied to the fresh style */
  const [styleVersion, setStyleVersion] = useState(0);
  const ready = styleVersion > 0;
  const [failed, setFailed] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const darkRef = useRef(dark);
  const handlers = useRef(props);
  handlers.current = props;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!token) {
      setFailed("Map token is not configured (NEXT_PUBLIC_MAPBOX_TOKEN).");
      return;
    }
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: DANUBE_VIEW.center,
      zoom: DANUBE_VIEW.zoom,
      pitch: 0,
      attributionControl: true,
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
    map.on("click", (e) => {
      const h = handlers.current;
      if (h.picking) {
        h.onPick([e.lngLat.lng, e.lngLat.lat]);
        return;
      }
      const layerIds = CLICKABLE.filter((id) => map.getLayer(id));
      const hit = layerIds.length ? map.queryRenderedFeatures(e.point, { layers: layerIds })[0] : undefined;
      const id = hit?.properties?.id;
      if (hit && typeof id === "string") {
        if (hit.layer?.id === "vessel-icons") {
          h.onSelectVessel(id);
          h.onSelectPoint(null);
        } else {
          h.onSelectPoint(id);
          h.onSelectVessel(null);
        }
        return;
      }
      h.onSelectVessel(null);
      h.onSelectPoint(null);
    });
    for (const layer of CLICKABLE) {
      map.on("mouseenter", layer, () => {
        if (!handlers.current.picking) map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layer, () => {
        if (!handlers.current.picking) map.getCanvas().style.cursor = "";
      });
    }

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Standard style switches day/night via config — no style reload, layers stay
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || darkRef.current === dark) return;
    darkRef.current = dark;
    applyBasemapTheme(map, dark);
    restyleLabels(map, dark);
  }, [dark, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("vessels") as GeoJSONSource | undefined)?.setData(vesselsToGeoJson(vessels));
  }, [vessels, ready, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("points") as GeoJSONSource | undefined)?.setData(pointsToGeoJson(points));
  }, [points, ready, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("draft") as GeoJSONSource | undefined)?.setData(draftGeoJson(draft));
  }, [draft, ready, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const show = (id: string, on: boolean) => map.getLayer(id) && map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    show("seamarks", layers.seamarks);
    show("vessel-icons", layers.vessels);
    show("vessel-selected", layers.vessels);
    const kinds = (Object.keys(layers.kinds) as PointKind[]).filter((k) => layers.kinds[k]);
    if (map.getLayer("point-icons")) map.setFilter("point-icons", ["in", ["get", "kind"], ["literal", kinds]]);
  }, [layers, ready, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = picking ? "crosshair" : "";
  }, [picking]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("vessel-selected")) return;
    map.setFilter("vessel-selected", ["==", ["get", "id"], selectedVesselId ?? ""]);
    const v = vessels.find((x) => x.id === selectedVesselId);
    if (v) map.flyTo({ center: resolvePosition(v).lngLat, zoom: Math.max(map.getZoom(), 9), duration: 900, essential: true });
    // fly only when the selection changes, not on every data refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVesselId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const p = points.find((x) => x.id === selectedPointId);
    if (p) map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 11), duration: 900, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPointId, ready]);

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
