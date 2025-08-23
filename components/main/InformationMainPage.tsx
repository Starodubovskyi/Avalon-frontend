"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { DivIcon } from "leaflet";
import { Ship, Anchor, Sailboat, Container } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

const MIN_ZOOM = 3;
const DEFAULT_ZOOM = 4;
const SINGLE_VESSEL_ZOOM = 7;

export default function DashboardPage() {
  const [icons, setIcons] = useState<{
    shipIcon?: DivIcon;
    tankerIcon?: DivIcon;
    sugboatIcon?: DivIcon;
  }>({});

  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      const L = await import("leaflet");
      const { renderToStaticMarkup } = await import("react-dom/server");

      const shipIcon = new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(<Ship className="text-teal-400 w-5 h-5" />),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const tankerIcon = new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(<Anchor className="text-violet-400 w-5 h-5" />),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const sugboatIcon = new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(<Sailboat className="text-rose-400 w-5 h-5" />),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      setIcons({ shipIcon, tankerIcon, sugboatIcon });
      setLeafletLoaded(true);
    };

    loadLeaflet();
  }, []);

  // Параллакс для хедера
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const ySub = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Точки для карты (можешь подставить свои)
  const points: [number, number][] = [
    [37.7749, -122.4194], // Ship: Shanghai → LA
    [51.5074, -0.1278],   // Tanker: Hamburg → NY
    [25.276987, 55.296249], // Sugboat: Dubai → Hamburg
  ];

  return (
    <section className="relative min-h-screen overflow-hidden text-white">
      {/* HERO */}
      <div ref={heroRef} className="relative z-10 px-6 md:px-12 pt-28 md:pt-10 pb-10">
        <AnimatePresence>
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h2
              style={{ y: yTitle }}
              className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]"
            >
              One Platform to Manage All{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300">
                Your Ships &amp; Cargoes
              </span>
            </motion.h2>

            <motion.p style={{ y: ySub }} className="text-base md:text-lg text-white/70 mt-5 max-w-2xl mx-auto">
              Connect ship owners with qualified inspectors to simplify
              compliance and maintenance processes.
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Карта + стеклянные панели */}
      <div className="relative z-10 px-6 md:px-12 pb-12">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="relative w-full h-[28rem]">
            {leafletLoaded && (
              <MapContainer
                center={[20, 0]}
                zoom={DEFAULT_ZOOM}
                minZoom={MIN_ZOOM}
                maxZoom={12}
                scrollWheelZoom
                worldCopyJump
                maxBounds={[[-85, -180], [85, 180]]}
                maxBoundsViscosity={0.9}
                className="w-full h-full z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                  noWrap
                />

                {/* Автоподгонка границ под все точки + защита от слишком малого зума */}
                <AutoFit points={points} minZoom={MIN_ZOOM} singleZoom={SINGLE_VESSEL_ZOOM} />

                <Marker position={points[0]} icon={icons.shipIcon}>
                  <Popup>Ship: Shanghai → LA</Popup>
                </Marker>
                <Marker position={points[1]} icon={icons.tankerIcon}>
                  <Popup>Tanker: Hamburg → NY</Popup>
                </Marker>
                <Marker position={points[2]} icon={icons.sugboatIcon}>
                  <Popup>Sugboat: Dubai → Hamburg</Popup>
                </Marker>
              </MapContainer>
            )}

            {/* Легенда */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute top-4 right-4 rounded-2xl border border-white/10 bg-white/[0.08] backdrop-blur-xl p-4 text-sm space-y-2 z-10"
            >
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-teal-300" />
                <span>Ship</span>
              </div>
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-violet-300" />
                <span>Tanker</span>
              </div>
              <div className="flex items-center gap-2">
                <Sailboat className="w-4 h-4 text-rose-300" />
                <span>Sugboat</span>
              </div>
            </motion.div>
          </div>

          {/* LIVE STATS */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-5">
              <h4 className="font-semibold text-white/90 mb-4">LIVE SHIPPING STATS</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-teal-300" />
                  Ships Underway
                </li>
                <li className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-rose-300" />
                  Active Ports
                </li>
                <li className="flex items-center gap-2">
                  <Sailboat className="w-4 h-4 text-violet-300" />3 Arrivals Today
                </li>
              </ul>
            </div>

            {[{ value: 12, label: "Ships Underway" }, { value: 4, label: "Active Ports" }, { value: 3, label: "Arrivals Today" }].map(
              ({ value, label }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6"
                >
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="text-sm text-white/70">{label}</div>
                </motion.div>
              )
            )}
          </motion.div>

          {/* Нижние панели */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6"
            >
              <h3 className="text-xl font-bold text-white">Upcoming Arrivals</h3>
              <ul className="space-y-3 text-sm mt-4">
                <li className="flex gap-3 items-start">
                  <Container className="w-4 h-4 text-teal-300 mt-1" />
                  <div>
                    <span className="font-semibold text-teal-300">Ship #12345</span>
                    <br />
                    <span className="text-white/70">From: Shanghai to Los Angeles</span>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <Container className="w-4 h-4 text-rose-300 mt-1" />
                  <div>
                    <span className="font-semibold text-rose-300">Tanker #12346</span>
                    <br />
                    <span className="text-white/70">From: Hamburg to New York</span>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6"
            >
              <h3 className="text-xl font-bold text-white">Quick Orders Panel</h3>
              <ul className="space-y-3 text-sm mt-4">
                {[
                  { id: "12345", from: "Shanghai", to: "Los Angeles" },
                  { id: "12346", from: "Hamburg", to: "New York" },
                  { id: "12347", from: "Dubai", to: "Hamburg" },
                ].map((item) => (
                  <li key={item.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex gap-3 items-start">
                    <Container className="w-4 h-4 text-cyan-300 mt-1" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-cyan-300 font-bold">In Transit</div>
                      <div className="font-semibold text-white">Cargo #{item.id}</div>
                      <div className="text-white/70">From: {item.from} — To: {item.to}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======= Вспомогательное авто-выравнивание карты ======= */
function AutoFit({
  points,
  minZoom,
  singleZoom = SINGLE_VESSEL_ZOOM,
}: {
  points: [number, number][];
  minZoom: number;
  singleZoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], singleZoom, { animate: true });
      return;
    }

    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    const sw: [number, number] = [Math.min(...lats), Math.min(...lngs)];
    const ne: [number, number] = [Math.max(...lats), Math.max(...lngs)];
    map.fitBounds([sw, ne], { padding: [40, 40], animate: true });

    if (map.getZoom() < minZoom) map.setZoom(minZoom);
  }, [points, map, minZoom, singleZoom]);

  return null;
}
