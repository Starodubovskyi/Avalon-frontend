"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


type Vessel = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  course: number;
};


const generateFakeVessels = (count: number): Vessel[] => {
  const vessels: Vessel[] = [];
  for (let i = 0; i < count; i++) {
    vessels.push({
      id: `${i}`,
      name: `Vessel ${i + 1}`,
      lat: 20 + Math.random() * 40 - 20, 
      lon: -30 + Math.random() * 60,     
      course: Math.floor(Math.random() * 360),
    });
  }
  return vessels;
};

const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const markersRef = useRef<Map<string, L.Marker>>(new window.Map());


  const vesselsRef = useRef<Vessel[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const container = mapRef.current;

    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }

    const map = L.map(container, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    mapInstanceRef.current = map;

    vesselsRef.current = generateFakeVessels(10);

    vesselsRef.current.forEach((vessel) => {
      const icon = L.divIcon({
        html: `<div style="transform: rotate(${vessel.course}deg); font-size: 24px;">🚢</div>`,
        iconSize: [30, 30],
        className: "",
      });

      const marker = L.marker([vessel.lat, vessel.lon], {
        icon,
        title: vessel.name,
      }).addTo(map);

      marker.bindPopup(`<strong>${vessel.name}</strong><br/>Course: ${vessel.course}°`);
      markersRef.current.set(vessel.id, marker);
    });

    const interval = setInterval(() => {
      vesselsRef.current = vesselsRef.current.map((v) => {
        const deltaLat = (Math.random() - 0.5) * 0.1;
        const deltaLon = (Math.random() - 0.5) * 0.1;

        const newLat = v.lat + deltaLat;
        const newLon = v.lon + deltaLon;
        const newCourse = (v.course + (Math.random() * 20 - 10) + 360) % 360;

        const marker = markersRef.current.get(v.id);
        if (marker) {
          marker.setLatLng([newLat, newLon]);
          marker.setIcon(
            L.divIcon({
              html: `<div style="transform: rotate(${newCourse}deg); font-size: 24px;">🚢</div>`,
              iconSize: [30, 30],
              className: "",
            })
          );
        }

        return {
          ...v,
          lat: newLat,
          lon: newLon,
          course: newCourse,
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return <div ref={mapRef} className="w-full h-screen z-0" id="leaflet-map" />;
};

export default Map;
