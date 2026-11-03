"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api/client";

/**
 * Point logos are not part of the list payload: GET /map-points/:id/logo?v=<logoVersion> returns the image
 * (staff only, so it goes through the shared client with its auth header). One request per id:version,
 * shared by the map markers and every <img>; a failed request is forgotten so it can be retried.
 */

const blobs = new Map<string, Promise<Blob>>();

export interface LogoRef {
  id: string;
  hasLogo: boolean;
  logoVersion: string | null;
}

export function loadPointLogo(id: string, version: string): Promise<Blob> {
  const key = `${id}:${version}`;
  const cached = blobs.get(key);
  if (cached) return cached;
  const request = api
    .get<Blob>(`/map-points/${encodeURIComponent(id)}/logo`, { params: { v: version }, responseType: "blob" })
    .then(({ data }) => data);
  blobs.set(key, request);
  request.catch(() => blobs.delete(key));
  return request;
}

/**
 * Object URL of a point's logo for <img>, or null (no logo, still loading, failed).
 * The previous URL is revoked when the logo changes and on unmount.
 */
export function usePointLogoUrl(point: LogoRef | null | undefined): string | null {
  const id = point?.hasLogo && point.logoVersion ? point.id : null;
  const version = id ? point?.logoVersion ?? null : null;
  const [url, setUrl] = useState<string | null>(null);
  const current = useRef<string | null>(null);

  useEffect(() => {
    const replace = (next: string | null) => {
      const prev = current.current;
      current.current = next;
      setUrl(next);
      if (prev) URL.revokeObjectURL(prev);
    };
    if (!id || !version) {
      replace(null);
      return;
    }
    let alive = true;
    loadPointLogo(id, version)
      .then((blob) => {
        if (alive) replace(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (alive) replace(null);
      });
    return () => {
      alive = false;
    };
  }, [id, version]);

  useEffect(
    () => () => {
      if (current.current) URL.revokeObjectURL(current.current);
      current.current = null;
    },
    [],
  );

  return url;
}
