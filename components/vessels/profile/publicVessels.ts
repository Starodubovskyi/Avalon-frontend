"use client";

export type PublicVessel = {
  id: string;
  name: string;
  photoUrl?: string;
  vesselType?: string;
  country?: string;
  flagEmoji?: string;
  imo?: string | number;
  mmsi?: string | number;
  callSign?: string;
  destinationPort?: string;
  reportedDestination?: string;
  reportedETA?: string;
  currentPort?: string;
  latestPositionTime?: string;
  latitude?: number;
  longitude?: number;
};

const LIST_KEY = "public:vessels";

export function getVesselById(id: string): PublicVessel | null {
  try {
    const one = localStorage.getItem(`vessel:${id}`);
    if (one) return JSON.parse(one);

    const listRaw = localStorage.getItem(LIST_KEY);
    if (listRaw) {
      const arr: PublicVessel[] = JSON.parse(listRaw);
      const found = arr.find((v) => String(v.id) === String(id));
      if (found) return found;
    }
  } catch {}
  return null;
}

export function setVesselsList(list: PublicVessel[]) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  } catch {}
}
