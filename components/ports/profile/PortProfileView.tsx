"use client";

import type { PublicPort } from "./publicPorts";

const dash = (v?: string | number | null) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

export default function PortProfileView({ port }: { port: PublicPort }) {
  const card =
    "rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className={`${card} overflow-hidden`}>
          {port.photoUrl ? (
            <img
              src={port.photoUrl}
              alt={port.port}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="h-64 bg-gray-100 dark:bg-white/5" />
          )}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-white/10">
            <div className="text-sm">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Summary
              </div>
              <p className="text-[13px] text-gray-700 dark:text-gray-300">
                Port{" "}
                <b className="text-gray-900 dark:text-gray-100">{port.port}</b>
                {port.country ? (
                  <>
                    {" "}
                    in <b>{port.country}</b>
                  </>
                ) : null}
                . UNLOCODE: {dash(port.unlocode)}.
              </p>
            </div>
          </div>
        </div>

        <div className={`${card} p-4`}>
          <h3 className="text-sm font-semibold mb-3">Statistics</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-[13px] text-gray-700 dark:text-gray-300">
            <Row k="Local time" v={dash(port.timezone)} />
            <Row k="Vessels in port" v={dash(port.vessels)} />
            <Row k="Arrivals (24h)" v={dash(port.arrivals)} />
            <Row k="Departures (24h)" v={dash(port.departures)} />
            <Row k="Expected arrivals" v={dash(port.expectedArrivals)} />
            <Row k="Coverage" v={dash(port.coverage)} />
          </dl>
        </div>
      </div>

      {/* Right */}
      <div className="space-y-5">
        <div className={`${card} p-4`}>
          <h3 className="text-sm font-semibold mb-3">General</h3>
          <dl className="text-[13px] text-gray-700 dark:text-gray-300">
            <Row k="Port" v={dash(port.port)} />
            <Row k="Country" v={dash(port.country)} />
            <Row k="UNLOCODE" v={dash(port.unlocode)} />
            <Row k="Area (global)" v={dash(port.geoArea1)} />
            <Row k="Area (local)" v={dash(port.geoArea2)} />
            <Row k="Related anchorage" v={dash(port.anchorage)} />
            <Row k="Latitude" v={dash(port.latitude)} />
            <Row k="Longitude" v={dash(port.longitude)} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-1">
      <dt className="col-span-1 text-gray-500 dark:text-gray-400">{k}</dt>
      <dd className="col-span-2 text-gray-900 dark:text-gray-100">{v}</dd>
    </div>
  );
}
