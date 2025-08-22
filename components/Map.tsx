"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import VesselOverlay from "@/components/map/VesselOverlay";
import { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";
import type { VesselInfo } from "@/components/map/VesselInfoPanel";
import RightDock from "./map/right-dock/RightDock";

function generateFakeVessels(count: number): VesselInfo[] {
  const photos = [
    "https://images.unsplash.com/photo-1548502632-6d14d2b46b9f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565787143815-7d0ebdcc5d9e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop",
  ];
  const types = ["Crude Oil Tanker", "Bulk Carrier", "Container Ship"];
  const flags = ["🇬🇷", "🇲🇹", "🇵🇦", "🇨🇾", "🇲🇭"];
  const ports = ["ES TAR", "IT GEN", "FR MRS", "MA TNG", "PT LIS"];

  const list: VesselInfo[] = [];
  for (let i = 0; i < count; i++) {
    const lat = -10 + Math.random() * 60;
    const lon = -35 + Math.random() * 70;
    const course = Math.floor(Math.random() * 360);
    list.push({
      id: `${i}`,
      name: `Vessel ${i + 1}`,
      lat,
      lon,
      course,
      type: types[i % types.length],
      flagEmoji: flags[i % flags.length],
      photoUrl: photos[i % photos.length],
      departurePort: ports[i % ports.length],
      atd: "2025-08-17 15:23",
      reportedEta: "2025-08-20 16:00",
      status: ["Underway Using Engine", "In Port", "Anchorage"][i % 3],
      speed: 4 + Math.random() * 14,
      loadCondition: "In Ballast",
      receivedAgo: "2 minutes ago",
    });
  }
  return list;
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [adapter, setAdapter] = useState<LeafletAdapter | null>(null);
  const [allVessels] = useState<VesselInfo[]>(() => generateFakeVessels(120));
  const [count, setCount] = useState(allVessels.length);

  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current as any;
    if (container._leaflet_id) container._leaflet_id = null;

    const map = L.map(container, {
      center: [0, 0],
      zoom: 3,
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });

    const a = new LeafletAdapter(map);

    // базовая подложка через адаптер (синхронизировано с правым доком)
    const saved = (typeof window !== "undefined" && (localStorage.getItem("basemap_v1") as any)) || "dark";
    a.setBasemap(saved === "light" || saved === "osm" || saved === "sat" ? saved : "dark");

    a.loadVessels(allVessels);
    setAdapter(a);

    return () => {
      a.destroy();
      map.remove();
    };
  }, [allVessels]);

  return (
    <div className="relative h-screen w-full">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      {adapter && (
        <>
          <VesselOverlay adapter={adapter} detailsHref={(id) => `/vessels/${id}`} />
          <RightDock adapter={adapter} />
        </>
      )}

      <div className="absolute right-2 bottom-2 z-[1200] rounded-md bg-black/60 px-2 py-1 text-xs text-white">
        {count} visible
      </div>
    </div>
  );
}
