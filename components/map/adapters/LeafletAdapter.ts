"use client";

import L from "leaflet";
import type { VesselInfo } from "../VesselInfoPanel";

export interface MapAdapter {
  getContainer(): HTMLElement;
  project(lat: number, lon: number): { x: number; y: number };
  onMove(handler: () => void): () => void;

  onMapClick(handler: (lat: number, lon: number) => void): () => void;
  onMarkerSelect(handler: (vessel: VesselInfo) => void): void;

  highlightMarker(vesselId: string, selected: boolean): void;

  drawPastTrack(vesselId: string, pct: number): void;
  clearPastTrack(vesselId: string): void;

  enableRouteTool(onDistance: (nm: number | null) => void): void;
  disableRouteTool(): void;

  getVesselById(id: string): VesselInfo | null;

  /** Горячая замена набора судов */
  setVessels(vessels: VesselInfo[]): void;

  /** Базовая карта и оверлеи */
  setBasemap(style: "osm" | "light" | "dark" | "sat"): void;
  toggleLayer(name: "ports" | "anchorages" | "routes", on: boolean): void;

  /** Сервисные штуки */
  getVisibleCount(): number;
  fitToVisible(): void;
  refresh(): void;

  destroy(): void;
}

export class LeafletAdapter implements MapAdapter {
  private map: L.Map;
  private baseLayer: L.TileLayer | null = null;

  private markers = new Map<string, L.Marker>();
  private histories = new Map<string, L.LatLng[]>();
  private tracks = new Map<string, L.Polyline>();
  private routeLayer: L.Polyline | null = null;

  private selectedId: string | null = null;
  private onSelect?: (v: VesselInfo) => void;
  private moveTimer: number | null = null;

  private routeOn = false;
  private routePoints: L.LatLng[] = [];
  private onDistanceCb: ((nm: number | null) => void) | null = null;

  private vessels: VesselInfo[] = [];

  // доп. слои
  private overlayPorts: L.LayerGroup | null = null;
  private overlayAnchorages: L.LayerGroup | null = null;
  private overlayRoutes: L.LayerGroup | null = null;

  constructor(map: L.Map) {
    this.map = map;
    // если кто-то уже добавил tileLayer — запомним как baseLayer
    this.map.eachLayer((ly) => {
      if ((ly as any) instanceof L.TileLayer) this.baseLayer = ly as L.TileLayer;
    });
  }

  // === БАЗОВАЯ РАБОТА С ВЕССЕЛАМИ ===
  public loadVessels(vessels: VesselInfo[]) {
    this.setVessels(vessels);
  }

  public setVessels(vessels: VesselInfo[]) {
    // очистка старого
    this.tracks.forEach((t) => t.remove());
    this.tracks.clear();
    if (this.routeLayer) {
      this.routeLayer.remove();
      this.routeLayer = null;
    }
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
    this.histories.clear();
    this.selectedId = null;

    if (this.moveTimer) {
      window.clearInterval(this.moveTimer);
      this.moveTimer = null;
    }
    if (this.routeOn) this.disableRouteTool();

    // загрузка нового
    this.vessels = vessels;
    vessels.forEach((v) => {
      const m = L.marker([v.lat, v.lon], {
        icon: this.shipIcon(v.course, false),
        title: v.name,
      });
      m.on("click", () => this.onSelect?.(v));
      m.addTo(this.map);
      this.markers.set(v.id, m);
      this.histories.set(v.id, [L.latLng(v.lat, v.lon)]);
    });

    this.startSimulation();
  }

  private startSimulation() {
    this.moveTimer = window.setInterval(() => {
      this.vessels = this.vessels.map((v) => {
        const deltaLat = (Math.random() - 0.5) * 0.08;
        const deltaLon = (Math.random() - 0.5) * 0.08;
        const newLat = v.lat + deltaLat;
        const newLon = v.lon + deltaLon;
        const newCourse = (v.course + (Math.random() * 20 - 10) + 360) % 360;

        const m = this.markers.get(v.id);
        if (m) {
          m.setLatLng([newLat, newLon]);
          m.setIcon(this.shipIcon(newCourse, this.selectedId === v.id));
        }
        const arr = this.histories.get(v.id)!;
        arr.push(L.latLng(newLat, newLon));
        if (arr.length > 150) arr.shift();

        return { ...v, lat: newLat, lon: newLon, course: newCourse };
      });
    }, 4000);
  }

  private shipIcon(courseDeg: number, selected: boolean) {
    const size = selected ? 28 : 22;
    const fill = selected ? "#1d4ed8" : "#0f172a";
    const glow = selected ? "filter: drop-shadow(0 0 8px rgba(29,78,216,0.9));" : "";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-12 -12 24 24" style="transform: rotate(${courseDeg}deg); ${glow}">
        <g>
          <path d="M0,-10 L6,8 L0,4 L-6,8 Z" fill="${fill}" stroke="${fill}" stroke-width="0.8"/>
          <circle cx="0" cy="-5.8" r="1.4" fill="#ffffff" />
        </g>
      </svg>
    `;
    return L.divIcon({ html: svg, iconSize: [size, size], className: "" });
  }

  // === БАЗОВАЯ КАРТА / ОВЕРЛЕИ ===
  public setBasemap(style: "osm" | "light" | "dark" | "sat") {
    const styles = {
      osm: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; OpenStreetMap contributors',
      },
      light: {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; OSM &copy; CARTO',
      },
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; OSM &copy; CARTO',
      },
      sat: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: '&copy; Esri & contributors',
      },
    } as const;

    const s = styles[style];
    if (!s) return;

    // удалить старый baseLayer (или обнаружить, если он был добавлен снаружи)
    if (!this.baseLayer) {
      this.map.eachLayer((ly) => {
        if ((ly as any) instanceof L.TileLayer) this.baseLayer = ly as L.TileLayer;
      });
    }
    if (this.baseLayer) this.map.removeLayer(this.baseLayer);

    this.baseLayer = L.tileLayer(s.url, { attribution: s.attribution });
    this.baseLayer.addTo(this.map);
  }

  public toggleLayer(name: "ports" | "anchorages" | "routes", on: boolean) {
    if (name === "ports") {
      if (!this.overlayPorts) this.overlayPorts = this.makePortsLayer();
      on ? this.overlayPorts.addTo(this.map) : this.map.removeLayer(this.overlayPorts);
    }
    if (name === "anchorages") {
      if (!this.overlayAnchorages) this.overlayAnchorages = this.makeAnchoragesLayer();
      on ? this.overlayAnchorages.addTo(this.map) : this.map.removeLayer(this.overlayAnchorages);
    }
    if (name === "routes") {
      if (!this.overlayRoutes) this.overlayRoutes = this.makeRoutesLayer();
      on ? this.overlayRoutes.addTo(this.map) : this.map.removeLayer(this.overlayRoutes);
    }
  }

  private makePortsLayer() {
    const g = L.layerGroup();
    // демо-точки портов
    const pts = [
      [51.505, -0.09], // London
      [37.77, -122.43], // SF
      [35.68, 139.69], // Tokyo
      [31.23, 121.47], // Shanghai
      [22.30, 114.17], // HK
      [25.27, 55.30], // Jebel Ali
      [52.37, 4.90], // Amsterdam
      [43.32, 5.37], // Marseille
    ];
    pts.forEach(([lat, lon]) =>
      L.circleMarker([lat, lon], {
        radius: 5,
        color: "#2563eb",
        weight: 2,
        fillColor: "#60a5fa",
        fillOpacity: 0.9,
      }).addTo(g)
    );
    return g;
  }

  private makeAnchoragesLayer() {
    const g = L.layerGroup();
    const pts = [
      [1.25, 103.8], // Singapore
      [34.0, 24.0], // Med
      [29.5, 32.5], // Suez
      [-33.9, 18.4], // Cape Town
    ];
    pts.forEach(([lat, lon]) =>
      L.circleMarker([lat, lon], {
        radius: 5,
        color: "#f59e0b",
        weight: 2,
        fillColor: "#fbbf24",
        fillOpacity: 0.9,
      }).addTo(g)
    );
    return g;
  }

  private makeRoutesLayer() {
    const g = L.layerGroup();
    const lines: [L.LatLngExpression, L.LatLngExpression][] = [
      [[1.25, 103.8], [29.5, 32.5]], // Singapore -> Suez
      [[29.5, 32.5], [36.1, -5.36]], // Suez -> Gibraltar
      [[36.1, -5.36], [40.4, -3.7]], // Gibraltar -> Iberia (условно)
    ];
    lines.forEach(([a, b]) =>
      L.polyline([a, b], { color: "#22c55e", weight: 2, opacity: 0.8, dashArray: "6,4" }).addTo(g)
    );
    return g;
  }

  // === SERVICE ===
  public getVisibleCount() {
    const b = this.map.getBounds();
    let n = 0;
    this.markers.forEach((m) => {
      if (b.contains(m.getLatLng())) n++;
    });
    return n;
  }

  public fitToVisible() {
    const pts: L.LatLng[] = [];
    this.markers.forEach((m) => pts.push(m.getLatLng()));
    if (!pts.length) return;
    this.map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
  }

  public refresh() {
    // простое "обновление": пересоздать маркеры и перезапустить симуляцию
    this.setVessels(this.vessels.slice());
  }

  // === Мосты для модалки/роутов/треков ===
  public getContainer(): HTMLElement {
    return this.map.getContainer();
  }

  public project(lat: number, lon: number) {
    const p = this.map.latLngToContainerPoint([lat, lon]);
    return { x: p.x, y: p.y };
  }

  public onMove(handler: () => void) {
    const fn = () => handler();
    this.map.on("move zoom", fn as any);
    return () => this.map.off("move zoom", fn as any);
  }

  public onMapClick(handler: (lat: number, lon: number) => void) {
    const fn = (e: L.LeafletMouseEvent) => handler(e.latlng.lat, e.latlng.lng);
    this.map.on("click", fn as any);
    return () => this.map.off("click", fn as any);
  }

  public onMarkerSelect(handler: (vessel: VesselInfo) => void) {
    this.onSelect = handler;
  }

  public highlightMarker(vesselId: string, selected: boolean) {
    this.selectedId = selected ? vesselId : null;
    const v = this.getVesselById(vesselId);
    const m = this.markers.get(vesselId);
    if (m && v) {
      m.setZIndexOffset(selected ? 1000 : 0);
      m.setIcon(this.shipIcon(v.course, selected));
    }
  }

  public drawPastTrack(vesselId: string, pct: number) {
    const pts = this.histories.get(vesselId) || [];
    if (pts.length < 2) return;
    const cut = Math.max(2, Math.round((pct / 100) * pts.length));
    const used = pts.slice(0, cut);
    const exists = this.tracks.get(vesselId);
    if (exists) {
      exists.setLatLngs(used);
    } else {
      const poly = L.polyline(used, { weight: 3, opacity: 0.9 });
      poly.addTo(this.map);
      this.tracks.set(vesselId, poly);
    }
  }

  public clearPastTrack(vesselId: string) {
    const t = this.tracks.get(vesselId);
    if (t) {
      t.remove();
      this.tracks.delete(vesselId);
    }
  }

  public enableRouteTool(onDistance: (nm: number | null) => void) {
    this.routeOn = true;
    this.routePoints = [];
    this.onDistanceCb = onDistance;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!this.routeOn) return;
      this.routePoints.push(e.latlng);
      if (this.routePoints.length > 2) this.routePoints.shift();

      if (this.routePoints.length === 2) {
        const [a, b] = this.routePoints;
        const dist = this.haversineNm(a, b);
        if (this.routeLayer) {
          this.routeLayer.setLatLngs(this.routePoints);
        } else {
          this.routeLayer = L.polyline(this.routePoints, {
            weight: 3,
            dashArray: "6,6",
          }).addTo(this.map);
        }
        this.onDistanceCb?.(dist);
      } else {
        this.onDistanceCb?.(null);
        if (this.routeLayer) this.routeLayer.setLatLngs(this.routePoints);
      }
    };

    this.map.on("click", handleClick as any);
    (this as any)._routeClick = handleClick;
  }

  public disableRouteTool() {
    this.routeOn = false;
    this.routePoints = [];
    this.onDistanceCb?.(null);
    if (this.routeLayer) {
      this.routeLayer.remove();
      this.routeLayer = null;
    }
    const handleClick = (this as any)._routeClick;
    if (handleClick) {
      this.map.off("click", handleClick as any);
      (this as any)._routeClick = null;
    }
  }

  public getVesselById(id: string) {
    return this.vessels.find((v) => v.id === id) || null;
  }

  public destroy() {
    if (this.moveTimer) window.clearInterval(this.moveTimer);
    this.tracks.forEach((t) => t.remove());
    this.tracks.clear();
    if (this.routeLayer) this.routeLayer.remove();
    this.routeLayer = null;
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
    this.histories.clear();
  }

  private haversineNm(a: L.LatLng, b: L.LatLng) {
    const R = 6371e3;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const d = 2 * R * Math.asin(Math.sqrt(h));
    return d / 1852;
  }
}
