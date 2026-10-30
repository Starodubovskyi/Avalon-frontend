import type mapboxgl from "mapbox-gl";
import { installShipIcons } from "./shipIcons";
import { installPointIcons } from "./pointIcons";
import { placesGeoJson } from "./fleetGeo";

export const STYLE_URL = "mapbox://styles/mapbox/standard";
const SEAMARK_TILES = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";
const EMPTY = { type: "FeatureCollection" as const, features: [] };
const FONT_BOLD = ["DIN Pro Bold", "Arial Unicode MS Bold"];
const FONT_MEDIUM = ["DIN Pro Medium", "Arial Unicode MS Regular"];

/** Mapbox Standard look: day preset for the light theme, night for dark; POI clutter off */
export function applyBasemapTheme(map: mapboxgl.Map, dark: boolean) {
  try {
    map.setConfigProperty("basemap", "lightPreset", dark ? "night" : "day");
    map.setConfigProperty("basemap", "showPointOfInterestLabels", false);
    map.setConfigProperty("basemap", "showTransitLabels", false);
  } catch {
    /* non-Standard style: nothing to configure */
  }
  installShipIcons(map, dark);
  installPointIcons(map, dark);
}

function textColors(dark: boolean) {
  return { text: dark ? "#e2e8f0" : "#0f172a", halo: dark ? "rgba(2,6,23,0.92)" : "rgba(255,255,255,0.96)" };
}

/** All custom sources/layers; Standard style needs slot "top" to draw above the basemap */
export function installLayers(map: mapboxgl.Map, dark: boolean) {
  applyBasemapTheme(map, dark);
  const { text, halo } = textColors(dark);

  if (!map.getSource("seamarks")) {
    map.addSource("seamarks", { type: "raster", tiles: [SEAMARK_TILES], tileSize: 256, maxzoom: 18 });
    map.addLayer({ id: "seamarks", type: "raster", source: "seamarks", minzoom: 9, slot: "top" });
  }
  if (!map.getSource("places")) {
    map.addSource("places", { type: "geojson", data: placesGeoJson() });
    map.addLayer({
      id: "places-dot",
      type: "circle",
      source: "places",
      slot: "top",
      paint: {
        "circle-radius": 4.5,
        "circle-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#2b5db0",
        "circle-emissive-strength": 1,
      },
    });
    map.addLayer({
      id: "places-label",
      type: "symbol",
      source: "places",
      slot: "top",
      layout: {
        "text-field": ["get", "name"],
        "text-size": 12,
        "text-offset": [0, 1.1],
        "text-anchor": "top",
        "text-font": FONT_MEDIUM,
      },
      paint: { "text-color": text, "text-halo-color": halo, "text-halo-width": 1.4, "text-emissive-strength": 1 },
    });
  }
  if (!map.getSource("points")) {
    map.addSource("points", { type: "geojson", data: EMPTY });
    map.addLayer({
      id: "point-icons",
      type: "symbol",
      source: "points",
      slot: "top",
      layout: {
        "icon-image": ["get", "icon"],
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "text-field": ["step", ["zoom"], "", 10, ["get", "name"]],
        "text-size": 11,
        "text-offset": [0, 0.4],
        "text-anchor": "top",
        "text-optional": true,
        "text-font": FONT_MEDIUM,
      },
      paint: { "text-color": text, "text-halo-color": halo, "text-halo-width": 1.3, "icon-emissive-strength": 1, "text-emissive-strength": 1 },
    });
  }
  if (!map.getSource("draft")) {
    map.addSource("draft", { type: "geojson", data: EMPTY });
    map.addLayer({
      id: "draft-ring",
      type: "circle",
      source: "draft",
      slot: "top",
      paint: {
        "circle-radius": 14,
        "circle-color": "rgba(43,93,176,0.18)",
        "circle-stroke-width": 2.5,
        "circle-stroke-color": "#2b5db0",
        "circle-emissive-strength": 1,
      },
    });
  }
  if (!map.getSource("vessels")) {
    map.addSource("vessels", { type: "geojson", data: EMPTY });
    map.addLayer({
      id: "vessel-selected",
      type: "circle",
      source: "vessels",
      slot: "top",
      filter: ["==", ["get", "id"], ""],
      paint: {
        "circle-radius": 18,
        "circle-color": "rgba(43,93,176,0.15)",
        "circle-stroke-width": 2.5,
        "circle-stroke-color": dark ? "#f8fafc" : "#0f172a",
        "circle-emissive-strength": 1,
      },
    });
    map.addLayer({
      id: "vessel-icons",
      type: "symbol",
      source: "vessels",
      slot: "top",
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
        "text-font": FONT_BOLD,
      },
      paint: {
        "icon-opacity": ["get", "opacity"],
        "text-color": text,
        "text-halo-color": halo,
        "text-halo-width": 1.4,
        "icon-emissive-strength": 1,
        "text-emissive-strength": 1,
      },
    });
  }
}

/** Halo/label colours follow the theme without reloading the style */
export function restyleLabels(map: mapboxgl.Map, dark: boolean) {
  const { text, halo } = textColors(dark);
  for (const id of ["places-label", "point-icons", "vessel-icons"]) {
    if (!map.getLayer(id)) continue;
    map.setPaintProperty(id, "text-color", text);
    map.setPaintProperty(id, "text-halo-color", halo);
  }
  if (map.getLayer("vessel-selected")) {
    map.setPaintProperty("vessel-selected", "circle-stroke-color", dark ? "#f8fafc" : "#0f172a");
  }
}
