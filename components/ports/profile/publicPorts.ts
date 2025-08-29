"use client";

export type PublicPort = {
  id: string;
  port: string;
  country?: string;
  flagEmoji?: string;
  flagAlpha2?: string;
  unlocode?: string;
  photoUrl?: string;
  timezone?: string;
  vessels?: number;
  arrivals?: number;
  departures?: number;
  expectedArrivals?: number;
  anchorage?: string;
  geoArea1?: string;
  geoArea2?: string;
  coverage?: string;
  latitude?: number;
  longitude?: number;
};

export function getPortById(id: string): PublicPort | null {
  try {
    const one = localStorage.getItem(`port:${id}`);
    if (one) return JSON.parse(one);
    const listRaw = localStorage.getItem("public:ports");
    if (listRaw) {
      const arr = JSON.parse(listRaw);
      return arr.find((p: any) => String(p.id) === String(id)) || null;
    }
  } catch {}
  return null;
}
