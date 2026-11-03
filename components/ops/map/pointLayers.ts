import type mapboxgl from "mapbox-gl";
import type { ExpressionSpecification } from "mapbox-gl";

/**
 * Team points: clustered GeoJSON (count bubbles when zoomed out), "building" markers that grow with zoom,
 * a selection ring on the ground and a label with title + RANK from zoom 9.
 */

export const POINT_SOURCE = "points";
export const POINT_LAYERS = {
  clusterHalo: "point-cluster-halo",
  clusters: "point-clusters",
  clusterCount: "point-cluster-count",
  selected: "point-selected",
  icons: "point-icons",
  labels: "point-labels",
} as const;

export const CLUSTER_MAX_ZOOM = 11;
/** Zoom at which a selected point is shown unclustered */
export const POINT_FOCUS_ZOOM = CLUSTER_MAX_ZOOM + 1.5;
const LABEL_FROM_ZOOM = 9;

const EMPTY = { type: "FeatureCollection" as const, features: [] };
const FONT_BOLD = ["DIN Pro Bold", "Arial Unicode MS Bold"];
const FONT_MEDIUM = ["DIN Pro Medium", "Arial Unicode MS Regular"];
const BRAND = "#2b5db0";

function outline(dark: boolean) {
  return dark ? "rgba(2,6,23,0.92)" : "#ffffff";
}

function textColors(dark: boolean) {
  return { text: dark ? "#e2e8f0" : "#0f172a", halo: dark ? "rgba(2,6,23,0.92)" : "rgba(255,255,255,0.96)" };
}

/**
 * Title on the first line, gold RANK under it. Kept zoom-independent on purpose: Mapbox applies per-section
 * colours only to data-driven ("source") text fields, so the zoom gate is the label layer's minzoom.
 */
function labelField(dark: boolean): ExpressionSpecification {
  return [
    "format",
    ["get", "name"],
    {},
    "\n",
    {},
    ["get", "rank"],
    { "font-scale": 0.8, "text-font": ["literal", FONT_BOLD], "text-color": ["to-color", dark ? "#fbbf24" : "#b45309"] },
  ];
}

export function installPointLayers(map: mapboxgl.Map, dark: boolean) {
  const { text, halo } = textColors(dark);
  map.addSource(POINT_SOURCE, { type: "geojson", data: EMPTY, cluster: true, clusterRadius: 48, clusterMaxZoom: CLUSTER_MAX_ZOOM });

  // Cluster bubbles sit at port towns: without a slot they render above the basemap's place labels,
  // otherwise "Izmail"/"Reni" would cover the count. Markers stay in slot "top", under vessels.

  map.addLayer({
    id: POINT_LAYERS.clusterHalo,
    type: "circle",
    source: POINT_SOURCE,
    filter: ["has", "point_count"],
    paint: {
      "circle-radius": ["step", ["get", "point_count"], 26, 10, 31, 50, 38],
      "circle-color": ["step", ["get", "point_count"], BRAND, 10, "#4338ca", 50, "#7c3aed"],
      "circle-opacity": 0.28,
      "circle-blur": 0.55,
      "circle-emissive-strength": 1,
    },
  });
  map.addLayer({
    id: POINT_LAYERS.clusters,
    type: "circle",
    source: POINT_SOURCE,
    filter: ["has", "point_count"],
    paint: {
      "circle-radius": ["step", ["get", "point_count"], 17, 10, 21, 50, 26],
      "circle-color": ["step", ["get", "point_count"], BRAND, 10, "#4338ca", 50, "#7c3aed"],
      "circle-stroke-width": 3,
      "circle-stroke-color": outline(dark),
      "circle-emissive-strength": 1,
    },
  });
  map.addLayer({
    id: POINT_LAYERS.clusterCount,
    type: "symbol",
    source: POINT_SOURCE,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": FONT_BOLD,
      "text-size": ["step", ["get", "point_count"], 13, 10, 14, 50, 15],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: { "text-color": "#ffffff", "text-emissive-strength": 1 },
  });
  map.addLayer({
    id: POINT_LAYERS.selected,
    type: "circle",
    source: POINT_SOURCE,
    slot: "top",
    filter: ["==", ["get", "id"], ""],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 14, 12, 22, 16, 26],
      "circle-color": ["get", "color"],
      "circle-opacity": 0.16,
      "circle-stroke-width": 3,
      "circle-stroke-color": ["get", "color"],
      "circle-pitch-alignment": "map",
      "circle-emissive-strength": 1,
    },
  });
  map.addLayer({
    id: POINT_LAYERS.icons,
    type: "symbol",
    source: POINT_SOURCE,
    slot: "top",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": ["get", "icon"],
      "icon-anchor": "bottom",
      "icon-offset": [0, 4.5],
      "icon-size": ["interpolate", ["linear"], ["zoom"], 4, 0.5, 8, 0.66, 11, 0.86, 14, 1],
      // overlap + default z-order = viewport-y: southern buildings stand in front, like in a strategy game
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
    paint: { "icon-emissive-strength": 1 },
  });
  map.addLayer({
    id: POINT_LAYERS.labels,
    type: "symbol",
    source: POINT_SOURCE,
    slot: "top",
    minzoom: LABEL_FROM_ZOOM,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": labelField(dark),
      "text-size": ["interpolate", ["linear"], ["zoom"], LABEL_FROM_ZOOM, 10.5, 14, 12],
      "text-offset": [0, 0.55],
      "text-anchor": "top",
      "text-line-height": 1.15,
      "text-max-width": 16,
      "text-font": FONT_MEDIUM,
    },
    paint: { "text-color": text, "text-halo-color": halo, "text-halo-width": 1.4, "text-emissive-strength": 1 },
  });
}

/** Theme switch without a style reload */
export function restylePointLayers(map: mapboxgl.Map, dark: boolean) {
  if (map.getLayer(POINT_LAYERS.clusters)) map.setPaintProperty(POINT_LAYERS.clusters, "circle-stroke-color", outline(dark));
  if (map.getLayer(POINT_LAYERS.labels)) {
    const { text, halo } = textColors(dark);
    map.setLayoutProperty(POINT_LAYERS.labels, "text-field", labelField(dark));
    map.setPaintProperty(POINT_LAYERS.labels, "text-color", text);
    map.setPaintProperty(POINT_LAYERS.labels, "text-halo-color", halo);
  }
}
