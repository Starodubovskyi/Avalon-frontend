import mapboxgl from "mapbox-gl";
import type { VesselInfo } from "../VesselInfoPanel";

export type Unsubscribe = () => void;

export interface MapAdapter {
  getContainer(): HTMLElement;
  project(lat: number, lon: number): { x: number; y: number };

  onMove(handler: () => void): Unsubscribe;
  onMapClick(handler: (lat: number, lon: number) => void): Unsubscribe;
  onMarkerSelect(handler: (vessel: VesselInfo) => void): Unsubscribe;

  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;

  highlightMarker(vesselId: string, selected: boolean): void;
  drawPastTrack(vesselId: string, pct: number): void;
  clearPastTrack(vesselId: string): void;
  enableRouteTool(onDistance: (nm: number | null) => void): void;
  disableRouteTool(): void;
  getVesselById(id: string): VesselInfo | null;
  setVessels(vessels: VesselInfo[]): void;
  loadVessels(vessels: VesselInfo[]): void;
  setBasemap(style: "osm" | "light" | "dark" | "sat"): void;
  toggleLayer(name: "ports" | "anchorages" | "routes", on: boolean): void;
  getVisibleCount(): number;
  fitToVisible(): void;
  refresh(): void;
  destroy(): void;

  setTempMarker(lat: number, lon: number): void;
  removeTempMarker(): void;
  renderCustomPoints(points: any[], onSelect: (id: string) => void): void;

  // --- НОВЫЕ МЕТОДЫ (которых не хватало) ---
  flyTo(lat: number, lon: number, zoom?: number): void;
  showUserLocation(lat: number, lon: number): void;
}

export class MapboxAdapter implements MapAdapter {
  private map: mapboxgl.Map;
  private listeners: Record<string, Function[]> = {};

  private markers = new Map<string, mapboxgl.Marker>();
  private customMarkers = new Map<string, mapboxgl.Marker>();
  private tempMarker: mapboxgl.Marker | null = null;
  private userMarker: mapboxgl.Marker | null = null; // Маркер пользователя

  private histories = new Map<string, [number, number][]>();

  private vessels: VesselInfo[] = [];
  private selectedId: string | null = null;
  private selectHandlers = new Set<(v: VesselInfo) => void>();
  private moveTimer: number | null = null;

  private routeOn = false;
  private routePoints: [number, number][] = [];
  private onDistanceCb: ((nm: number | null) => void) | null = null;

  private layerVisibility = {
    ports: false,
    anchorages: false,
    routes: false,
  };

  private currentStyleId: string = "sat";

  private readonly ID_TRACK = "active-vessel-track";
  private readonly ID_ROUTE_TOOL = "route-tool-line";
  private readonly ID_PORTS = "layer-ports";
  private readonly ID_ANCHORAGES = "layer-anchorages";
  private readonly ID_ROUTES = "layer-routes";

  constructor(map: mapboxgl.Map) {
    this.map = map;

    // Инъекция стилей анимации
    if (
      typeof document !== "undefined" &&
      !document.getElementById("marker-animations")
    ) {
      const style = document.createElement("style");
      style.id = "marker-animations";
      style.innerHTML = `
        @keyframes bounce-marker {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .marker-bounce {
          animation: bounce-marker 1.2s infinite ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }

    this.map.on("style.load", () => {
      this.restoreLayersAfterStyleChange();
    });

    this.map.on("moveend", () => this.emit("visible:change"));
    this.map.on("zoomend", () => this.emit("visible:change"));
  }

  /* --- Event Emitter --- */
  public on(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public off(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
  }

  private emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((fn) => fn(...args));
    }
  }
  /* --------------------- */

  public getContainer(): HTMLElement {
    return this.map.getContainer();
  }

  public loadVessels(vessels: VesselInfo[]) {
    this.setVessels(vessels);
  }

  public setVessels(vessels: VesselInfo[]) {
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
    this.histories.clear();

    if (this.map.getLayer(this.ID_TRACK)) this.map.removeLayer(this.ID_TRACK);
    if (this.map.getSource(this.ID_TRACK)) this.map.removeSource(this.ID_TRACK);

    this.selectedId = null;

    if (this.moveTimer) {
      window.clearInterval(this.moveTimer);
      this.moveTimer = null;
    }

    if (this.routeOn) this.disableRouteTool();

    this.vessels = vessels;

    vessels.forEach((v) => {
      const el = document.createElement("div");
      el.className = "vessel-marker";
      el.style.cursor = "pointer";
      el.innerHTML = this.getShipSvg(v.course, false);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectHandlers.forEach((fn) => {
          try {
            fn(v);
          } catch {}
        });
      });

      const marker = new mapboxgl.Marker({
        element: el,
        rotationAlignment: "map",
      })
        .setLngLat([v.lon, v.lat])
        .addTo(this.map);

      this.markers.set(v.id, marker);
      this.histories.set(v.id, [[v.lon, v.lat]]);
    });

    this.emit("visible:change");
    this.startSimulation();
  }

  /* --- НОВЫЕ МЕТОДЫ: ГЕОЛОКАЦИЯ И ПОЛЕТ --- */

  public flyTo(lat: number, lon: number, zoom: number = 14) {
    this.map.flyTo({
      center: [lon, lat],
      zoom: zoom,
      speed: 1.5,
      curve: 1,
      essential: true,
    });
  }

  public showUserLocation(lat: number, lon: number) {
    if (this.userMarker) this.userMarker.remove();

    const el = document.createElement("div");
    // Синяя пульсирующая точка
    el.innerHTML = `
      <span class="relative flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-lg"></span>
      </span>
    `;

    this.userMarker = new mapboxgl.Marker({ element: el })
      .setLngLat([lon, lat])
      .addTo(this.map);

    this.flyTo(lat, lon, 14);
  }

  /* --- ЛОГИКА КАСТОМНЫХ ТОЧЕК --- */

  public setTempMarker(lat: number, lon: number) {
    if (this.tempMarker) this.tempMarker.remove();

    const container = document.createElement("div");
    container.style.width = "40px";
    container.style.height = "40px";

    const inner = document.createElement("div");
    inner.className = "marker-bounce";

    inner.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#ef4444" stroke="#7f1d1d" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <path d="M12 2c-4.97 0-9 4.03-9 9 0 7 9 13 9 13s9-6 9-13c0-4.97-4.03-9-9-9zm0 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#ef4444"/>
        <circle cx="12" cy="11" r="2.5" fill="white" />
      </svg>
    `;

    container.appendChild(inner);

    this.tempMarker = new mapboxgl.Marker({
      element: container,
      offset: [0, -20],
    })
      .setLngLat([lon, lat])
      .addTo(this.map);
  }

  public removeTempMarker() {
    if (this.tempMarker) {
      this.tempMarker.remove();
      this.tempMarker = null;
    }
  }

  public renderCustomPoints(points: any[], onSelect: (id: string) => void) {
    const currentIds = new Set(points.map((p) => p.id));
    const totalCount = points.length;

    let size = 40;
    if (totalCount > 10) size = 30;
    if (totalCount > 50) size = 20;

    this.customMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        this.customMarkers.delete(id);
      }
    });

    points.forEach((p) => {
      const svgContent = this.getCustomMarkerSvg(size, p.isFavorite);

      if (!this.customMarkers.has(p.id)) {
        const el = document.createElement("div");
        el.className = "custom-point-marker";
        el.style.cursor = "pointer";
        el.innerHTML = svgContent;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelect(p.id);
        });

        const offsetY = -(size / 2);

        const marker = new mapboxgl.Marker({
          element: el,
          offset: [0, offsetY],
        })
          .setLngLat([p.lng, p.lat])
          .addTo(this.map);

        this.customMarkers.set(p.id, marker);
      } else {
        const marker = this.customMarkers.get(p.id);
        if (marker) {
          const el = marker.getElement();
          if (el.innerHTML !== svgContent) {
            el.innerHTML = svgContent;
            marker.setOffset([0, -(size / 2)]);
          }
        }
      }
    });
  }

  private getCustomMarkerSvg(size: number, isFavorite: boolean): string {
    const color = isFavorite ? "#fbbf24" : "#6366f1";
    const stroke = isFavorite ? "#b45309" : "#312e81";

    return `
      <div style="width: ${size}px; height: ${size}px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transition: all 0.2s;">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="${color}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white" stroke="none"></circle>
        </svg>
      </div>
    `;
  }

  /* ------------------------------------------- */

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
          m.setLngLat([newLon, newLat]);
          const el = m.getElement();
          const isSelected = this.selectedId === v.id;
          el.innerHTML = this.getShipSvg(newCourse, isSelected);
        }

        const arr = this.histories.get(v.id)!;
        arr.push([newLon, newLat]);
        if (arr.length > 150) arr.shift();

        return { ...v, lat: newLat, lon: newLon, course: newCourse };
      });
    }, 4000);
  }

  private getShipSvg(courseDeg: number, selected: boolean): string {
    const size = selected ? 28 : 22;
    const fill = selected ? "#1d4ed8" : "#0f172a";
    const glow = selected
      ? "filter: drop-shadow(0 0 8px rgba(29,78,216,0.9));"
      : "";

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-12 -12 24 24" style="transform: rotate(${courseDeg}deg); ${glow} display:block;">
        <g>
          <path d="M0,-10 L6,8 L0,4 L-6,8 Z" fill="${fill}" stroke="${fill}" stroke-width="0.8"/>
          <circle cx="0" cy="-5.8" r="1.4" fill="#ffffff" />
        </g>
      </svg>
    `;
  }

  public setBasemap(style: "osm" | "light" | "dark" | "sat") {
    const styles = {
      light: "mapbox://styles/mapbox/light-v11",
      dark: "mapbox://styles/mapbox/dark-v11",
      sat: "mapbox://styles/mapbox/satellite-streets-v12",
      osm: "mapbox://styles/mapbox/streets-v12",
    };

    const targetUrl = styles[style] || styles.light;

    if (this.currentStyleId === style) return;

    try {
      this.map.setStyle(targetUrl);
      this.currentStyleId = style;
    } catch (e) {
      console.error("Failed to set map style", e);
    }
  }

  private restoreLayersAfterStyleChange() {
    this.toggleLayer("ports", this.layerVisibility.ports);
    this.toggleLayer("anchorages", this.layerVisibility.anchorages);
    this.toggleLayer("routes", this.layerVisibility.routes);
    if (this.routeOn && this.routePoints.length > 0) {
      this.updateRouteToolLayer();
    }
  }

  public toggleLayer(name: "ports" | "anchorages" | "routes", on: boolean) {
    this.layerVisibility[name] = on;
    if (!this.map.isStyleLoaded()) return;

    if (name === "ports")
      this.manageGeoJSONLayer(
        this.ID_PORTS,
        on,
        this.getPortsGeoJSON(),
        "circle",
        {
          "circle-radius": 5,
          "circle-color": "#60a5fa",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#2563eb",
          "circle-opacity": 0.9,
        },
      );
    if (name === "anchorages")
      this.manageGeoJSONLayer(
        this.ID_ANCHORAGES,
        on,
        this.getAnchoragesGeoJSON(),
        "circle",
        {
          "circle-radius": 5,
          "circle-color": "#fbbf24",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f59e0b",
          "circle-opacity": 0.9,
        },
      );
    if (name === "routes")
      this.manageGeoJSONLayer(
        this.ID_ROUTES,
        on,
        this.getRoutesGeoJSON(),
        "line",
        {
          "line-color": "#22c55e",
          "line-width": 2,
          "line-opacity": 0.8,
          "line-dasharray": [2, 2],
        },
      );
  }

  private manageGeoJSONLayer(
    id: string,
    on: boolean,
    data: any,
    type: "circle" | "line",
    paint: any,
  ) {
    if (on) {
      if (!this.map.getSource(id)) {
        this.map.addSource(id, { type: "geojson", data });
        this.map.addLayer({ id: id, type: type, source: id, paint: paint });
      }
    } else {
      if (this.map.getLayer(id)) this.map.removeLayer(id);
      if (this.map.getSource(id)) this.map.removeSource(id);
    }
  }

  private getPortsGeoJSON() {
    return {
      type: "FeatureCollection",
      features: [
        [51.505, -0.09],
        [37.77, -122.43],
        [35.68, 139.69],
        [31.23, 121.47],
        [22.3, 114.17],
        [25.27, 55.3],
        [52.37, 4.9],
        [43.32, 5.37],
      ].map(([lat, lon]) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
      })),
    };
  }

  private getAnchoragesGeoJSON() {
    return {
      type: "FeatureCollection",
      features: [
        [1.25, 103.8],
        [34.0, 24.0],
        [29.5, 32.5],
        [-33.9, 18.4],
      ].map(([lat, lon]) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
      })),
    };
  }

  private getRoutesGeoJSON() {
    const lines = [
      [
        [1.25, 103.8],
        [29.5, 32.5],
      ],
      [
        [29.5, 32.5],
        [36.1, -5.36],
      ],
      [
        [36.1, -5.36],
        [40.4, -3.7],
      ],
    ];
    return {
      type: "FeatureCollection",
      features: lines.map((line) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: line.map(([lat, lon]) => [lon, lat]),
        },
      })),
    };
  }

  public getVisibleCount() {
    const bounds = this.map.getBounds();
    if (!bounds) return 0;
    let n = 0;
    this.markers.forEach((m) => {
      if (bounds.contains(m.getLngLat())) n++;
    });
    return n;
  }

  public fitToVisible() {
    if (this.markers.size === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    this.markers.forEach((m) => bounds.extend(m.getLngLat()));
    this.map.fitBounds(bounds, { padding: 40, maxZoom: 10 });
  }

  public refresh() {
    this.map.resize();
    this.setVessels(this.vessels.slice());
  }

  public project(lat: number, lon: number) {
    const p = this.map.project([lon, lat]);
    return { x: p.x, y: p.y };
  }

  public onMove(handler: () => void): Unsubscribe {
    this.map.on("move", handler);
    this.map.on("zoom", handler);
    return () => {
      this.map.off("move", handler);
      this.map.off("zoom", handler);
    };
  }

  public onMapClick(handler: (lat: number, lon: number) => void): Unsubscribe {
    const fn = (e: mapboxgl.MapMouseEvent) =>
      handler(e.lngLat.lat, e.lngLat.lng);
    this.map.on("click", fn);
    return () => this.map.off("click", fn);
  }

  public onMarkerSelect(handler: (vessel: VesselInfo) => void): Unsubscribe {
    this.selectHandlers.add(handler);
    return () => {
      this.selectHandlers.delete(handler);
    };
  }

  public highlightMarker(vesselId: string, selected: boolean) {
    this.selectedId = selected ? vesselId : null;
    const v = this.getVesselById(vesselId);
    const m = this.markers.get(vesselId);
    if (m && v) {
      const el = m.getElement();
      el.style.zIndex = selected ? "100" : "auto";
      el.innerHTML = this.getShipSvg(v.course, selected);
    }
  }

  public drawPastTrack(vesselId: string, pct: number) {
    const pts = this.histories.get(vesselId) || [];
    if (pts.length < 2) return;
    const cut = Math.max(2, Math.round((pct / 100) * pts.length));
    const used = pts.slice(0, cut);
    if (this.map.getLayer(this.ID_TRACK)) this.map.removeLayer(this.ID_TRACK);
    if (this.map.getSource(this.ID_TRACK)) this.map.removeSource(this.ID_TRACK);
    this.map.addSource(this.ID_TRACK, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: used },
        properties: {},
      },
    });
    this.map.addLayer({
      id: this.ID_TRACK,
      type: "line",
      source: this.ID_TRACK,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 3,
        "line-opacity": 0.9,
      },
    });
  }

  public clearPastTrack(vesselId: string) {
    if (this.map.getLayer(this.ID_TRACK)) this.map.removeLayer(this.ID_TRACK);
    if (this.map.getSource(this.ID_TRACK)) this.map.removeSource(this.ID_TRACK);
  }

  private routeClickHandler = (e: mapboxgl.MapMouseEvent) => {
    if (!this.routeOn) return;
    const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    this.routePoints.push(pt);
    if (this.routePoints.length > 2) this.routePoints.shift();
    this.updateRouteToolLayer();
    if (this.routePoints.length === 2) {
      const dist = this.haversineNm(this.routePoints[0], this.routePoints[1]);
      this.onDistanceCb?.(dist);
    } else {
      this.onDistanceCb?.(null);
    }
  };

  private updateRouteToolLayer() {
    const data: any = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: this.routePoints },
      properties: {},
    };
    const source = this.map.getSource(
      this.ID_ROUTE_TOOL,
    ) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(data);
    } else {
      this.map.addSource(this.ID_ROUTE_TOOL, { type: "geojson", data });
      this.map.addLayer({
        id: this.ID_ROUTE_TOOL,
        type: "line",
        source: this.ID_ROUTE_TOOL,
        paint: {
          "line-color": "#000",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });
    }
  }

  public enableRouteTool(onDistance: (nm: number | null) => void) {
    this.routeOn = true;
    this.routePoints = [];
    this.onDistanceCb = onDistance;
    this.map.on("click", this.routeClickHandler);
    this.map.getCanvas().style.cursor = "crosshair";
  }

  public disableRouteTool() {
    this.routeOn = false;
    this.routePoints = [];
    this.onDistanceCb?.(null);
    this.map.off("click", this.routeClickHandler);
    this.map.getCanvas().style.cursor = "";
    if (this.map.getLayer(this.ID_ROUTE_TOOL))
      this.map.removeLayer(this.ID_ROUTE_TOOL);
    if (this.map.getSource(this.ID_ROUTE_TOOL))
      this.map.removeSource(this.ID_ROUTE_TOOL);
  }

  public getVesselById(id: string) {
    return this.vessels.find((v) => v.id === id) || null;
  }

  public destroy() {
    if (this.moveTimer) window.clearInterval(this.moveTimer);
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
    this.customMarkers.forEach((m) => m.remove());
    this.customMarkers.clear();
    if (this.tempMarker) this.tempMarker.remove();
    if (this.userMarker) this.userMarker.remove(); // Очистка маркера пользователя
    this.histories.clear();
  }

  private haversineNm(a: [number, number], b: [number, number]) {
    const R = 6371e3;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b[1] - a[1]);
    const dLon = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const d = 2 * R * Math.asin(Math.sqrt(h));
    return d / 1852;
  }
}
