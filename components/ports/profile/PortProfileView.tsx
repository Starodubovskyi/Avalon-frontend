"use client";

import type { PublicPort } from "./publicPorts";

const dash = (v?: string | number | null) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

export default function PortProfileView({ port }: { port: PublicPort }) {
  const card =
    "rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow-sm";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className={`${card} overflow-hidden group`}>
          {port.photoUrl ? (
            <div className="relative h-64 overflow-hidden">
              <img
                src={port.photoUrl}
                alt={port.port}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
            </div>
          ) : (
            <div className="h-64 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 text-sm">
              No photo available
            </div>
          )}
          <div className="px-5 py-5 border-t border-gray-200 dark:border-white/10">
            <div className="text-sm">
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-base">
                Summary
              </div>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Port{" "}
                <b className="text-slate-900 dark:text-slate-100">
                  {port.port}
                </b>
                {port.country ? (
                  <>
                    {" "}
                    in <b>{port.country}</b>
                  </>
                ) : null}
                . UNLOCODE:{" "}
                <span className="font-mono text-xs bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">
                  {dash(port.unlocode)}
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        <div className={`${card} p-5`}>
          <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white px-1">
            Statistics
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[13px] text-slate-700 dark:text-slate-300">
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
      <div className="space-y-6">
        <div className={`${card} p-5`}>
          <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white px-1">
            General
          </h3>
          <dl className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1">
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
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-50 dark:border-white/5 last:border-0">
      <dt className="col-span-1 text-slate-500 dark:text-slate-400 font-medium">
        {k}
      </dt>
      <dd className="col-span-2 text-slate-900 dark:text-slate-100 font-medium">
        {v}
      </dd>
    </div>
  );
}
