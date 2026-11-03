"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { type GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { useFormatter, useTranslations } from "next-intl";
import { DANUBE_VIEW, resolvePosition } from "@/lib/vessels/geo";
import type { VesselView } from "@/lib/vessels/types";
import type { PointKind, TeamPoint } from "@/lib/points/team-points";
import { draftGeoJson, pointsToGeoJson, vesselsToGeoJson } from "./fleetGeo";
import { STYLE_URL, applyBasemapTheme, installLayers, restyleLabels } from "./mapLayers";
import { POINT_FOCUS_ZOOM, POINT_LAYERS, POINT_SOURCE } from "./pointLayers";
import { useLogoImages } from "./useLogoImages";

export interface LayerVisibility {
  vessels: boolean;
  seamarks: boolean;
  kinds: Record<PointKind, boolean>;
  /** only my ★ favourite points */
  favoritesOnly: boolean;
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

const CLICKABLE = ["vessel-icons", POINT_LAYERS.icons, POINT_LAYERS.labels, POINT_LAYERS.clusters];

/** Cluster bubble click: zoom in until it splits */
function expandCluster(map: mapboxgl.Map, clusterId: number, center: [number, number]) {
  const source = map.getSource(POINT_SOURCE) as GeoJSONSource | undefined;
  source?.getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err || zoom == null) return;
    map.easeTo({ center, zoom: zoom + 0.25, duration: 650, essential: true });
  });
}

export function FleetMap(props: FleetMapProps) {
  const { vessels, points, selectedVesselId, selectedPointId, layers, picking, draft } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  /** bumps on every style load so data/filters are re-applied to the fresh style */
  const [styleVersion, setStyleVersion] = useState(0);
  const ready = styleVersion > 0;
  const t = useTranslations("map");
  const format = useFormatter();
  // setup problem, worded on render
  const [failed, setFailed] = useState<"noToken" | "rejected" | null>(null);
  // Mapbox control tooltips in the interface language (read once, when the map is created)
  const mapLocale = useRef<Record<string, string>>({});
  mapLocale.current = {
    "NavigationControl.ZoomIn": t("controls.zoomIn"),
    "NavigationControl.ZoomOut": t("controls.zoomOut"),
    "NavigationControl.ResetBearing": t("controls.resetBearing"),
    "AttributionControl.ToggleAttribution": t("controls.toggleAttribution"),
    "AttributionControl.MapFeedback": t("controls.feedback"),
    "Map.Title": t("controls.map"),
    "ScaleControl.NauticalMiles": t("controls.nauticalMiles"),
  };
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const darkRef = useRef(dark);
  const handlers = useRef(props);
  handlers.current = props;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
  const { logoVersion, logoIconFor } = useLogoImages(mapRef, ready, points);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!token) {
      setFailed("noToken");
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
      locale: mapLocale.current,
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
      if (status === 401 || status === 403) setFailed("rejected");
    });
    map.on("click", (e) => {
      const h = handlers.current;
      if (h.picking) {
        h.onPick([e.lngLat.lng, e.lngLat.lat]);
        return;
      }
      const layerIds = CLICKABLE.filter((id) => map.getLayer(id));
      const hit = layerIds.length ? map.queryRenderedFeatures(e.point, { layers: layerIds })[0] : undefined;
      const clusterId = hit?.properties?.cluster_id;
      if (hit && hit.layer?.id === POINT_LAYERS.clusters && typeof clusterId === "number" && hit.geometry.type === "Point") {
        expandCluster(map, clusterId, hit.geometry.coordinates as [number, number]);
        return;
      }
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
    (map.getSource(POINT_SOURCE) as GeoJSONSource | undefined)?.setData(pointsToGeoJson(points, logoIconFor, (n) => format.number(n)));
  }, [points, ready, styleVersion, logoVersion, logoIconFor, format]);

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
    // point kinds and favourites are filtered in the data, so cluster counts stay honest
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
    if (map.getLayer(POINT_LAYERS.selected)) map.setFilter(POINT_LAYERS.selected, ["==", ["get", "id"], selectedPointId ?? ""]);
    const p = points.find((x) => x.id === selectedPointId);
    if (p) map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), POINT_FOCUS_ZOOM), duration: 900, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPointId, ready]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-6 text-center text-sm text-muted-foreground">
          {t(`errors.${failed}`)}
        </div>
      ) : null}
    </div>
  );
}
