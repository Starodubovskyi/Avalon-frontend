"use client";

import type { CatalogLayerKind } from "@/lib/domain/map-layer";
import type { GeoJsonFeatureCollection } from "@/lib/domain/map-layer";
import type { Map } from "mapbox-gl";
import mapboxgl from "mapbox-gl";

const SOURCE_PREFIX = "avalon-kind";

const LAYER_COLOR: Record<CatalogLayerKind, string> = {
  company: "#3b82f6",
  vessel: "#14b8a6",
  port: "#f59e0b",
};

const boundMaps = new WeakSet<Map>();

function sourceId(kind: CatalogLayerKind): string {
  return `${SOURCE_PREFIX}-${kind}`;
}

function clusterLayerId(kind: CatalogLayerKind): string {
  return `${sourceId(kind)}-clusters`;
}

function countLayerId(kind: CatalogLayerKind): string {
  return `${sourceId(kind)}-count`;
}

function unclusteredLayerId(kind: CatalogLayerKind): string {
  return `${sourceId(kind)}-unclustered`;
}

function emptyCollection(): GeoJsonFeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function ensureKindLayers(
  map: Map,
  kind: CatalogLayerKind,
  collection: GeoJsonFeatureCollection,
): void {
  const id = sourceId(kind);
  const color = LAYER_COLOR[kind];
  const existing = map.getSource(id);

  if (existing && existing.type === "geojson") {
    existing.setData(collection);
  } else if (!existing) {
    map.addSource(id, {
      type: "geojson",
      data: collection,
      cluster: true,
      clusterMaxZoom: 10,
      clusterRadius: 48,
    });
  }

  if (!map.getLayer(clusterLayerId(kind))) {
    map.addLayer({
      id: clusterLayerId(kind),
      type: "circle",
      source: id,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": color,
        "circle-radius": ["step", ["get", "point_count"], 16, 4, 20, 10, 26],
        "circle-opacity": 0.85,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#0f172a",
      },
    });
  }

  if (!map.getLayer(countLayerId(kind))) {
    map.addLayer({
      id: countLayerId(kind),
      type: "symbol",
      source: id,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-size": 12,
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      },
      paint: {
        "text-color": "#ffffff",
      },
    });
  }

  if (!map.getLayer(unclusteredLayerId(kind))) {
    map.addLayer({
      id: unclusteredLayerId(kind),
      type: "circle",
      source: id,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": color,
        "circle-radius": 7,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#0f172a",
      },
    });
  }
}

function setKindVisibility(map: Map, kind: CatalogLayerKind, visible: boolean): void {
  const value = visible ? "visible" : "none";
  for (const id of [
    clusterLayerId(kind),
    countLayerId(kind),
    unclusteredLayerId(kind),
  ]) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", value);
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("://") || value.includes("\\")) return null;
  return value;
}

function bindKindInteractions(map: Map, kind: CatalogLayerKind): void {
  const clusters = clusterLayerId(kind);
  const points = unclusteredLayerId(kind);

  map.on("click", clusters, (event) => {
    const feature = event.features?.[0];
    const clusterId = feature?.properties?.cluster_id;
    const source = map.getSource(sourceId(kind));
    if (
      typeof clusterId !== "number" ||
      !source ||
      source.type !== "geojson" ||
      typeof source.getClusterExpansionZoom !== "function"
    ) {
      return;
    }
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || typeof zoom !== "number" || !feature?.geometry) return;
      if (feature.geometry.type !== "Point") return;
      map.easeTo({
        center: feature.geometry.coordinates as [number, number],
        zoom,
      });
    });
  });

  map.on("click", points, (event) => {
    const feature = event.features?.[0];
    if (!feature || feature.geometry.type !== "Point") return;
    const title =
      typeof feature.properties?.title === "string"
        ? escapeHtml(feature.properties.title)
        : "";
    const subtitle =
      typeof feature.properties?.subtitle === "string"
        ? escapeHtml(feature.properties.subtitle)
        : "";
    const hrefRaw =
      typeof feature.properties?.href === "string"
        ? feature.properties.href
        : "";
    const href = safeHref(hrefRaw);
    const html = `<div style="font:12px/1.4 sans-serif;max-width:200px">
      <strong>${title}</strong>
      ${subtitle ? `<div>${subtitle}</div>` : ""}
      ${href ? `<a href="${escapeHtml(href)}">Open</a>` : ""}
    </div>`;
    new mapboxgl.Popup({ closeButton: false, offset: 12 })
      .setLngLat(feature.geometry.coordinates as [number, number])
      .setHTML(html)
      .addTo(map);
  });

  map.on("mouseenter", clusters, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", clusters, () => {
    map.getCanvas().style.cursor = "";
  });
  map.on("mouseenter", points, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", points, () => {
    map.getCanvas().style.cursor = "";
  });
}

export function syncKindLayer(
  map: Map,
  kind: CatalogLayerKind,
  collection: GeoJsonFeatureCollection | undefined,
  visible: boolean,
): void {
  if (!map.isStyleLoaded()) return;
  ensureKindLayers(map, kind, collection ?? emptyCollection());
  if (!boundMaps.has(map)) {
    boundMaps.add(map);
    bindKindInteractions(map, "company");
    bindKindInteractions(map, "vessel");
    bindKindInteractions(map, "port");
  }
  setKindVisibility(map, kind, visible);
}
