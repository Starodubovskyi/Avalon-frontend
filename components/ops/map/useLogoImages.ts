"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import type mapboxgl from "mapbox-gl";
import type { TeamPoint } from "@/lib/points/team-points";
import { loadPointLogo } from "@/lib/points/logo-cache";
import { addLogoIcon, decodeLogo, logoIconId } from "./pointIcons";

/**
 * Logo markers on demand: fetches each point's logo (shared logo cache), draws it into a marker and
 * registers it with map.addImage. Keeps pointId → iconId so a replaced logo, a new kind or a deleted point
 * removes the old image. Ready images are announced once per animation frame, so K logos cost one setData.
 */
export function useLogoImages(mapRef: MutableRefObject<mapboxgl.Map | null>, ready: boolean, points: TeamPoint[]) {
  const [version, setVersion] = useState(0);
  /** pointId → iconId currently on the map */
  const onMap = useRef(new Map<string, string>());
  /** pointId → iconId the latest data asks for */
  const wanted = useRef(new Map<string, string>());
  const pending = useRef(new Set<string>());
  const failed = useRef(new Set<string>());
  const frame = useRef<number | null>(null);

  const announce = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setVersion((v) => v + 1);
    });
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const next = new Map<string, string>();
    for (const p of points) if (p.hasLogo && p.logoVersion) next.set(p.id, logoIconId(p.id, p.logoVersion, p.kind));
    wanted.current = next;

    // logo replaced, kind changed (rim colour) or point gone / filtered out: drop the old image
    for (const [pointId, iconId] of Array.from(onMap.current.entries())) {
      if (next.get(pointId) === iconId) continue;
      onMap.current.delete(pointId);
      if (map.hasImage(iconId)) map.removeImage(iconId);
    }

    for (const p of points) {
      const iconId = next.get(p.id);
      if (!iconId || !p.logoVersion) continue;
      if (onMap.current.get(p.id) === iconId || pending.current.has(iconId) || failed.current.has(iconId)) continue;
      pending.current.add(iconId);
      const { id, kind } = p;
      loadPointLogo(id, p.logoVersion)
        .then(decodeLogo)
        .then((img) => {
          // the map may be gone, or the point changed again while the image was loading
          if (mapRef.current === map && wanted.current.get(id) === iconId) {
            if (addLogoIcon(map, iconId, img, kind)) {
              onMap.current.set(id, iconId);
              announce();
            } else failed.current.add(iconId);
          }
          if (!(img instanceof HTMLImageElement)) img.close();
        })
        .catch(() => failed.current.add(iconId))
        .finally(() => pending.current.delete(iconId));
    }
  }, [mapRef, ready, points, announce]);

  /** Logo marker of a point if it is already on the map */
  const logoIconFor = useCallback((pointId: string) => onMap.current.get(pointId) ?? null, []);

  return { logoVersion: version, logoIconFor };
}
