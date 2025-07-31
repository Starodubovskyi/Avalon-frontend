"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Ship, Anchor, Sailboat, Container } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
  const [icons, setIcons] = useState<{
    shipIcon?: L.DivIcon;
    tankerIcon?: L.DivIcon;
    sugboatIcon?: L.DivIcon;
  }>({});

  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      const L = await import("leaflet");
      const { renderToStaticMarkup } = await import("react-dom/server");

      const shipIcon = new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(<Ship className="text-green-600 w-5 h-5" />),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const tankerIcon = new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(
          <Anchor className="text-blue-600 w-5 h-5" />
        ),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const sugboatIcon = new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(
          <Sailboat className="text-red-600 w-5 h-5" />
        ),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      setIcons({ shipIcon, tankerIcon, sugboatIcon });
      setLeafletLoaded(true);
    };

    loadLeaflet();
  }, []);

  return (
    <section className="pt-32 min-h-screen bg-white dark:bg-gray-900">
      <div className="px-6 md:px-12 pb-12">
        <AnimatePresence>
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
              One Platform to Manage All
              <span className="italic text-teal-500">Your Ships & Cargoes</span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto dark:text-gray-300">
              Connect ship owners with qualified inspectors to simplify
              compliance and maintenance processes.
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden dark:bg-gray-800">
          <div className="relative w-full h-[28rem]">
            {leafletLoaded && (
              <MapContainer
                center={[20, 0]}
                zoom={2}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[37.7749, -122.4194]} icon={icons.shipIcon}>
                  <Popup>Ship: Shanghai → LA</Popup>
                </Marker>
                <Marker position={[51.5074, -0.1278]} icon={icons.tankerIcon}>
                  <Popup>Tanker: Hamburg → NY</Popup>
                </Marker>
                <Marker
                  position={[25.276987, 55.296249]}
                  icon={icons.sugboatIcon}
                >
                  <Popup>Sugboat: Dubai → Hamburg</Popup>
                </Marker>
              </MapContainer>
            )}

            <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow text-sm space-y-2 z-10 dark:bg-gray-700 dark:text-white">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-green-600" />
                <span>Ship</span>
              </div>
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-blue-600" />
                <span>Tanker</span>
              </div>
              <div className="flex items-center gap-2">
                <Sailboat className="w-4 h-4 text-red-600" />
                <span>Sugboat</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
            <div className="bg-white p-4 rounded-2xl shadow dark:bg-gray-700 dark:text-white">
              <h4 className="font-semibold text-gray-800 mb-4 dark:text-white">
                LIVE SHIPPING STATS
              </h4>

              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-green-600" />
                  Ships Underway
                </li>
                <li className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-red-600" />
                  Active Ports
                </li>
                <li className="flex items-center gap-2">
                  <Sailboat className="w-4 h-4 text-blue-500" />3 Arrivals Today
                </li>
              </ul>
            </div>

            {[
              { value: 12, label: "Ships Underway" },
              { value: 4, label: "Active Ports" },
              { value: 3, label: "Arrivals Today" },
            ].map(({ value, label }, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow dark:bg-gray-700 dark:text-white"
              >
                <div className="text-3xl font-bold text-gray-800 dark:text-white">
                  {value}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="bg-white rounded-2xl shadow p-6 dark:bg-gray-700 dark:text-white">
              <h3 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                Upcoming Arrivals
              </h3>

              <ul className="space-y-3 text-gray-700 text-sm dark:text-gray-300">
                <li className="flex gap-2 items-start">
                  <Container className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <span className="font-semibold text-green-600">
                      Ship #12345
                    </span>
                    <br />
                    From: Shanghai to Los Angeles
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <Container className="w-4 h-4 text-red-600 mt-1" />
                  <div>
                    <span className="font-semibold text-red-600">
                      Tanker #12346
                    </span>
                    <br />
                    From: Hamburg to New York
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 dark:bg-gray-700 dark:text-white">
              <h3 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                Quick Orders Panel
              </h3>

              <ul className="space-y-3 text-sm">
                {[
                  { id: "12345", from: "Shanghai", to: "Los Angeles" },
                  { id: "12346", from: "Hamburg", to: "New York" },
                  { id: "12347", from: "Dubai", to: "Hamburg" },
                ].map((item) => (
                  <li
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-md p-4 flex gap-3 items-start shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <Container className="w-4 h-4 text-blue-600 mt-1" />
                    <div>
                      <div className="text-xs uppercase text-blue-600 font-bold">
                        In Transit
                      </div>
                      <div className="font-semibold">Cargo #{item.id}</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        From: {item.from} — To: {item.to}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
