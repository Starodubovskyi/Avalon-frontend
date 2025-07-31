"use client";

import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Ship,
  Anchor,
  Sailboat,
  Container,
} from "lucide-react";

const shipIcon = new L.DivIcon({
  className: "",
  html: renderToStaticMarkup(<Ship className="text-green-600 w-5 h-5" />),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const tankerIcon = new L.DivIcon({
  className: "",
  html: renderToStaticMarkup(<Anchor className="text-blue-600 w-5 h-5" />),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const sugboatIcon = new L.DivIcon({
  className: "",
  html: renderToStaticMarkup(<Sailboat className="text-red-600 w-5 h-5" />),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function DashboardPage() {
  return (
    <section className="pt-32 bg-gray-50 min-h-screen">
      <div className="p-6 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
            One Platform to Manage All{" "}
            <span className="text-teal-600 italic">Your Ships & Cargoes</span>
          </h1>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
            Connect ship owners with qualified inspectors to simplify compliance and maintenance processes.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="relative w-full h-[28rem]">
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

              <Marker position={[37.7749, -122.4194]} icon={shipIcon}>
                <Popup>Ship: Shanghai → LA</Popup>
              </Marker>

              <Marker position={[51.5074, -0.1278]} icon={tankerIcon}>
                <Popup>Tanker: Hamburg → NY</Popup>
              </Marker>

              <Marker position={[25.276987, 55.296249]} icon={sugboatIcon}>
                <Popup>Sugboat: Dubai → Hamburg</Popup>
              </Marker>
            </MapContainer>

            <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-md text-sm space-y-2 z-10">
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
            <div className="bg-gray-100 p-4 rounded-2xl">
              <h4 className="font-semibold text-gray-800 mb-4">LIVE SHIPPING STATS</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-green-600" />
                  Ships Underway
                </li>
                <li className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-red-600" />
                  Active Ports
                </li>
                <li className="flex items-center gap-2">
                  <Sailboat className="w-4 h-4 text-blue-500" />
                  3 Arrivals Today
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-gray-800">12</div>
              <div className="text-sm text-gray-600">Ships Underway</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-gray-800">4</div>
              <div className="text-sm text-gray-600">Active Ports</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-gray-800">3</div>
              <div className="text-sm text-gray-600">Arrivals Today</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Arrivals</h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex gap-2 items-start">
                  <Container className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <span className="font-semibold text-green-600">Ship #12345</span><br />
                    From: Shanghai to Los Angeles
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <Container className="w-4 h-4 text-red-600 mt-1" />
                  <div>
                    <span className="font-semibold text-red-600">Tanker #12346</span><br />
                    From: Hamburg to New York
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Orders Panel</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { id: "12345", from: "Shanghai", to: "Los Angeles" },
                  { id: "12346", from: "Hamburg", to: "New York" },
                  { id: "12347", from: "Dubai", to: "Hamburg" },
                ].map((item) => (
                  <li
                    key={item.id}
                    className="bg-gray-100 rounded-md p-4 flex gap-3 items-start"
                  >
                    <Container className="w-4 h-4 text-blue-600 mt-1" />
                    <div>
                      <div className="text-xs uppercase text-blue-600 font-bold">In Transit</div>
                      <div className="font-semibold">Cargo #{item.id}</div>
                      <div className="text-gray-600">
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
