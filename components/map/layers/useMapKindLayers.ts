"use client";

import { useEffect, useState } from "react";
import type { Map } from "mapbox-gl";
import {
  CATALOG_LAYER_KINDS,
  type CatalogLayerKind,
  type KindVisibility,
  type MapLayersResponse,
} from "@/lib/domain/map-layer";
import { isAbortError, listMapLayers } from "@/lib/api/map-layers";
import { syncKindLayer } from "./syncKindLayers";

export function useMapKindLayers(
  map: Map | null,
  visibility: Pick<KindVisibility, CatalogLayerKind>,
): void {
  const [layers, setLayers] = useState<MapLayersResponse | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    listMapLayers([...CATALOG_LAYER_KINDS], ac.signal)
      .then((data) => {
        setLayers(data);
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setLayers({});
      });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!map || !layers) return;

    const apply = () => {
      for (const kind of CATALOG_LAYER_KINDS) {
        syncKindLayer(map, kind, layers[kind], visibility[kind]);
      }
    };

    if (map.isStyleLoaded()) {
      apply();
    }
    map.on("style.load", apply);
    return () => {
      map.off("style.load", apply);
    };
  }, [
    map,
    layers,
    visibility.company,
    visibility.port,
    visibility.vessel,
  ]);
}
