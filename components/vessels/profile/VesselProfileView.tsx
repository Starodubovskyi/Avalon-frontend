"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { PublicVessel } from "./publicVessels";

import VesselOverlay from "@/components/map/VesselOverlay";
import { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";
import type { VesselInfo } from "@/components/map/VesselInfoPanel";

import { getCurrentSubscription } from "@/components/types/billing/subscription";
import {
  getPlanById,
  type Billing as BillingType,
} from "@/components/types/billing/plan";

import type { AdminCompany } from "@/components/admin/companies/types";
import { adminCompaniesMock } from "@/components/admin/companies/mock";

const Anchor = ({ id }: { id: string }) => (
  <span id={id} className="block -mt-24 pt-24" aria-hidden="true" />
);

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: typeof icon === "string" ? icon : icon.src,
  shadowUrl: typeof iconShadow === "string" ? iconShadow : iconShadow.src,
});
if (typeof window !== "undefined") {
  (L.Marker as any).prototype.options.icon = DefaultIcon;
}

const dash = (v?: string | number | null) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

type Business = {
  name: string;
  category?: string;
  logoUrl?: string;
  href?: string;
};

const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const mapBusinesses = (src: AdminCompany[]): Business[] =>
  src.map((c) => ({
    name: c.name,
    category: c.category,
    logoUrl: c.logoUrl,
    href: `/companies/${c.id}`,
  }));

const pickByPlace = (all: AdminCompany[], place?: string) => {
  const p = norm(place);
  if (!p) return [] as AdminCompany[];
  return all.filter((c) => {
    const city = norm(c.city);
    const country = norm(c.country?.replace(/[^a-zA-Z]/g, ""));
    return (!!city && p.includes(city)) || (!!country && p.includes(country));
  });
};

const fallbackTop = (all: AdminCompany[], n = 6) =>
  [...all]
    .sort((a, b) => (b.completeness ?? 0) - (a.completeness ?? 0))
    .slice(0, n);

type LL = { lat: number; lon: number };

const PORT_COORDS: Record<string, LL> = {
  rotterdam: { lat: 51.95, lon: 4.14 },
  "port of rotterdam": { lat: 51.95, lon: 4.14 },
  southampton: { lat: 50.9, lon: -1.4 },
  "port of southampton": { lat: 50.9, lon: -1.4 },
  "new york": { lat: 40.7, lon: -74.0 },
  suez: { lat: 29.96, lon: 32.55 },
  hamburg: { lat: 53.54, lon: 9.98 },
  "port of hamburg": { lat: 53.54, lon: 9.98 },
  "tanger-med": { lat: 35.89, lon: -5.5 },
  "ras tanura": { lat: 26.64, lon: 50.16 },
  singapore: { lat: 1.26, lon: 103.85 },
  "port of singapore": { lat: 1.26, lon: 103.85 },
};

const lower = (s?: string) => (s || "").toLowerCase().trim();
const coordsFor = (place?: string): LL | null => {
  const k = lower(place);
  if (!k) return null;
  return PORT_COORDS[k] || PORT_COORDS[k.replace(/^port of\s+/, "")] || null;
};

function vesselToOverlayInfo(v: PublicVessel): VesselInfo {
  const fromPortLL = coordsFor(v.currentPort);
  const toPortLL = coordsFor(v.destinationPort || v.reportedDestination);

  const lat =
    typeof v.latitude === "number"
      ? v.latitude
      : fromPortLL?.lat ?? toPortLL?.lat ?? 0;
  const lon =
    typeof v.longitude === "number"
      ? v.longitude
      : fromPortLL?.lon ?? toPortLL?.lon ?? 0;

  const courseBearing = (() => {
    if (fromPortLL && toPortLL) {
      const φ1 = (fromPortLL.lat * Math.PI) / 180;
      const φ2 = (toPortLL.lat * Math.PI) / 180;
      const Δλ = ((toPortLL.lon - fromPortLL.lon) * Math.PI) / 180;
      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x =
        Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      const θ = Math.atan2(y, x);
      const deg = ((θ * 180) / Math.PI + 360) % 360;
      return Math.round(deg);
    }
    return 90;
  })();

  const id = String((v as any).id ?? v.mmsi ?? v.imo ?? v.name ?? Date.now());
  const name = v.name || "Vessel";
  const type = v.vesselType || "Vessel";
  const flagEmoji = (v.flagEmoji || (v as any).flag || "") as string;
  const photoUrl = v.photoUrl ?? "/images/ship-placeholder.jpg";
  const departurePort = v.currentPort || "—";
  const reportedEta = v.reportedETA ?? "";
  const receivedAgo = v.latestPositionTime ? String(v.latestPositionTime) : "—";

  return {
    id,
    name,
    lat,
    lon,
    course: Number((v as any).course ?? courseBearing),
    type,
    flagEmoji,
    photoUrl,
    departurePort,
    atd: "",
    reportedEta,
    status: "Underway Using Engine",
    speed: Number((v as any).speed ?? 12),
    loadCondition: "Laden",
    receivedAgo,
  } as VesselInfo;
}

export default function VesselProfileView({
  vessel,
}: {
  vessel: PublicVessel;
}) {
  const lat = vessel.latitude ?? 0;
  const lng = vessel.longitude ?? 0;

  const card =
    "rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow-sm";

  const fromLabel = vessel.currentPort
    ? `Departure from ${vessel.currentPort}`
    : "Departure";
  const toLabel =
    vessel.destinationPort || vessel.reportedDestination
      ? `Arrival at ${vessel.destinationPort || vessel.reportedDestination}`
      : "Arrival";

  const bigFrom = (vessel.currentPort || "—").toUpperCase();
  const bigTo = (
    vessel.destinationPort ||
    vessel.reportedDestination ||
    "—"
  ).toUpperCase();

  const [subscription, setSubscription] = useState<{
    planName: string;
    billing: BillingType;
  } | null>(null);
  useEffect(() => {
    const refresh = () => {
      const sub = getCurrentSubscription();
      if (sub) {
        const p = getPlanById(sub.planId);
        if (p)
          return setSubscription({ planName: p.name, billing: sub.billing });
      }
      setSubscription(null);
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const hasEnterprise = subscription?.planName === "Maritime Enterprise";

  const arrivalCompanies = pickByPlace(
    adminCompaniesMock,
    vessel.destinationPort || vessel.reportedDestination
  );
  const nearCompanies = pickByPlace(adminCompaniesMock, vessel.currentPort);

  const arrivalBusinesses = mapBusinesses(
    arrivalCompanies.length
      ? arrivalCompanies
      : fallbackTop(adminCompaniesMock, 6)
  );
  const nearBusinesses = mapBusinesses(
    nearCompanies.length ? nearCompanies : fallbackTop(adminCompaniesMock, 6)
  );

  const progressPercent = Math.max(
    0,
    Math.min(1, (vessel as any).progressPercent ?? 0.3)
  );

  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const [adapter, setAdapter] = useState<LeafletAdapter | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !mapHostRef.current) return;

    const container = mapHostRef.current as any;
    if (container._leaflet_id) container._leaflet_id = null;

    const map = L.map(container, {
      center: [lat || 0, lng || 0],
      zoom: lat || lng ? 6 : 2,
      zoomControl: false,
      scrollWheelZoom: false,
      worldCopyJump: true,
    });

    const a = new LeafletAdapter(map);
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem("basemap_v1") as any)) ||
      "dark";
    a.setBasemap(
      saved === "light" || saved === "osm" || saved === "sat" ? saved : "dark"
    );

    const info = vesselToOverlayInfo(vessel);
    if (info) {
      a.loadVessels([info]);
      map.setView([info.lat, info.lon], 6);
    } else {
      a.loadVessels([]);
      map.setView([0, 0], 2);
    }

    setAdapter(a);

    return () => {
      a.destroy();
      map.remove();
    };
  }, [mounted, lat, lng, vessel]);

  return (
    <div className="w-full space-y-6">
      <Anchor id="overview" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${card} overflow-hidden`}>
            <div className="relative h-64 w-full">
              <div ref={mapHostRef} className="absolute inset-0" />
              {!mounted && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 animate-pulse rounded" />
              )}

              {adapter ? (
                <VesselOverlay
                  adapter={adapter}
                  detailsHref={(id) => `/vessels/${id}`}
                />
              ) : null}

              <Link
                href={`/map${vessel.mmsi ? `?mmsi=${vessel.mmsi}` : ""}`}
                className="absolute top-3 right-3 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-gray-200/50 bg-white/95 hover:bg-white hover:text-indigo-600 dark:border-white/10 dark:bg-black/80 dark:hover:bg-black dark:text-gray-200 dark:hover:text-indigo-400 shadow-sm backdrop-blur-sm transition-colors"
              >
                View on live map
              </Link>
            </div>

            <div className="px-4 sm:px-6 py-5 border-t border-gray-200 dark:border-white/10">
              <div className="text-sm">
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Current voyage
                </div>

                <div className="flex justify-between text-xs mb-1">
                  <span className="text-indigo-600 font-medium hover:underline dark:text-indigo-400 cursor-pointer">
                    {fromLabel}
                  </span>
                  <span className="text-indigo-600 font-medium hover:underline dark:text-indigo-400 cursor-pointer">
                    {toLabel}
                  </span>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      {bigFrom}
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      {bigTo}
                    </div>
                  </div>

                  <VoyageProgress percent={progressPercent} />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600 dark:text-gray-300 gap-2">
                    <div>
                      <div className="opacity-80">
                        Actual time of departure:
                      </div>
                      <div className="font-medium">—</div>
                    </div>
                    <div>
                      <div className="opacity-80">
                        Predicted time of arrival:
                      </div>
                      <div className="font-medium">
                        {dash(vessel.reportedETA)}
                      </div>
                    </div>
                  </div>

                  {hasEnterprise ? (
                    <EnterpriseVoyageTables vessel={vessel} />
                  ) : (
                    <LockedUpgradeBox />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-1">
              Businesses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BusinessesCard
                title="At arrival location"
                items={arrivalBusinesses}
              />
              <NearVesselCard items={nearBusinesses} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${card} p-5`}>
            <h3 className="text-sm font-semibold mb-3">Summary</h3>

            <div className="mb-4">
              <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Where is the ship?
              </div>
              <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                {vessel.vesselType || "Vessel"}{" "}
                <b className="text-gray-900 dark:text-gray-100">
                  {vessel.name}
                </b>{" "}
                {vessel.latestPositionTime
                  ? `is currently located (reported ${vessel.latestPositionTime})`
                  : "is active"}
                {vessel.currentPort ? (
                  <>
                    {" "}
                    near <b>{vessel.currentPort}</b>.
                  </>
                ) : (
                  "."
                )}
              </p>
            </div>

            <div>
              <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 mb-1">
                What kind of ship is this?
              </div>
              <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                <b className="text-gray-900 dark:text-gray-100">
                  {vessel.name}
                </b>
                {vessel.imo ? ` (IMO: ${vessel.imo})` : ""} is a{" "}
                <b className="text-gray-900 dark:text-gray-100">
                  {vessel.vesselType || "vessel"}
                </b>
                {vessel.flagEmoji ? (
                  <> sailing under the flag {vessel.flagEmoji}.</>
                ) : (
                  "."
                )}
              </p>
            </div>
          </div>

          {vessel.photoUrl ? (
            <div className={`${card} overflow-hidden group`}>
              <div className="relative">
                <img
                  src={vessel.photoUrl}
                  alt={vessel.name}
                  className="w-full h-56 sm:h-64 md:h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/90 hover:bg-white text-gray-900 shadow-sm backdrop-blur">
                    Upload a photo
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/90 hover:bg-white text-gray-900 shadow-sm backdrop-blur">
                    View all
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={`${card} p-5`}>
            <h3 className="text-sm font-semibold mb-3">General</h3>
            <dl className="text-[13px] text-gray-700 dark:text-gray-300">
              <Row k="Name" v={dash(vessel.name)} />
              <Row k="Flag" v={dash(vessel.flagEmoji)} />
              <Row k="IMO" v={dash(vessel.imo)} />
              <Row k="MMSI" v={dash(vessel.mmsi)} />
              <Row k="Call sign" v={dash(vessel.callSign)} />
              <Row k="AIS transponder class" v="Class A" />
              <Row k="General vessel type" v={dash(vessel.vesselType)} />
              <Row k="Detailed vessel type" v={dash(vessel.vesselType)} />
              <Row k="Service Status" v="Upgrade to unlock" muted />
              <Row k="Port of registry" v="Upgrade to unlock" muted />
              <Row k="Year built" v="Upgrade to unlock" muted />
            </dl>
            <div className="mt-5">
              <button className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
                AIS Station
              </button>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <h3 className="text-sm font-semibold mb-3">
              Latest AIS information
            </h3>
            <dl className="text-[13px] text-gray-700 dark:text-gray-300 space-y-2">
              <Row k="Position received" v={dash(vessel.latestPositionTime)} />
              <Row k="Latitude" v={dash(vessel.latitude)} />
              <Row k="Longitude" v={dash(vessel.longitude)} />
              <Row
                k="Reported destination"
                v={dash(vessel.reportedDestination || vessel.destinationPort)}
              />
              <Row k="Predicted time of arrival" v={dash(vessel.reportedETA)} />
              <Row k="AIS source" v="Roaming" />
            </dl>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
              <Link
                href="/upgrade"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 group"
              >
                Upgrade to global AIS coverage
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <h3 className="text-sm font-semibold mb-3">Notes</h3>
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50/50 dark:bg-white/[0.02] p-6 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Locked content
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Upgrade your account to unlock this
              </div>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Anchor id="port-calls" />
      <Anchor id="characteristics" />
      <Anchor id="ownership" />
      <Anchor id="performance" />
      <Anchor id="compliance" />
      <Anchor id="news" />
    </div>
  );
}

function Row({ k, v, muted }: { k: string; v: any; muted?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-1.5 border-b border-gray-50/50 dark:border-white/[0.02] last:border-0">
      <dt className="col-span-1 text-gray-500 dark:text-gray-400 font-medium">
        {k}
      </dt>
      <dd
        className={[
          "col-span-2 text-right sm:text-left",
          muted
            ? "text-gray-400 dark:text-gray-500 italic"
            : "text-gray-900 dark:text-gray-100",
        ].join(" ")}
      >
        {v}
      </dd>
    </div>
  );
}

function VoyageProgress({
  percent = 0.3,
  className = "",
}: {
  percent?: number;
  className?: string;
}) {
  const p = Math.max(0, Math.min(1, percent));
  const leftGap = "2rem";
  return (
    <div className={`relative my-6 h-10 ${className}`}>
      {/* Track */}
      <div className="absolute left-8 right-8 top-[22px] h-[4px] rounded-full bg-gray-200 dark:bg-white/10" />

      {/* Progress Bar (Gradient) */}
      <div
        className="absolute left-8 top-[22px] h-[4px] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500"
        style={{ width: `calc((100% - 4rem) * ${p})` }}
      />

      {/* Dotted future path */}
      <div
        className="absolute top-[22px] right-8 h-[4px]"
        style={{
          left: `calc(${leftGap} + (100% - 4rem) * ${p})`,
          backgroundImage:
            "radial-gradient(currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "12px 4px",
          backgroundRepeat: "repeat-x",
          opacity: 0.3,
          color: "#6b7280", // gray-500
        }}
      />

      {/* Start Dot */}
      <span className="absolute left-2 top-[19px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />

      {/* Current Ship Icon (Triangle) */}
      <span
        className="absolute top-[18px] -translate-x-1/2 text-indigo-500 drop-shadow-sm"
        style={{ left: `calc(${leftGap} + (100% - 4rem) * ${p})` }}
      >
        <span className="block w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-current" />
      </span>

      {/* Current Position Marker (Circle) */}
      <span
        className="absolute top-[14px] -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 shadow ring-4 ring-indigo-500/30"
        style={{ left: `calc(${leftGap} + (100% - 4rem) * ${p})` }}
        aria-label={`${Math.round(p * 100)}% of voyage`}
        title={`${Math.round(p * 100)}%`}
      />

      {/* Destination Icon */}
      <MapPin className="absolute right-2 top-[14px] w-5 h-5 text-gray-400 dark:text-gray-500" />
    </div>
  );
}

function EnterpriseVoyageTables({ vessel }: { vessel: PublicVessel }) {
  const cell =
    "py-2 text-[13px] border-t border-gray-200/70 dark:border-white/10 flex items-baseline justify-between gap-3";
  const wrap =
    "rounded-xl bg-gray-50 border border-gray-200/70 p-4 dark:bg-white/[0.04] dark:border-white/10";
  return (
    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={wrap}>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Voyage progress
        </div>
        <div className={cell}>
          <span className="text-gray-500">Vessel's current load condition</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Vessel's current draught</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Vessel's current speed</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Total voyage distance</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Time to destination</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
      </div>

      <div className={wrap}>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Arrival details
        </div>
        <div className={cell}>
          <span className="text-gray-500">Arrival location</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(vessel.destinationPort || vessel.reportedDestination)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Estimated time of arrival</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Predicted time of arrival</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(vessel.reportedETA)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Est. vs Pred. arrival</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Air temperature</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {dash(undefined)}
          </span>
        </div>
      </div>
    </div>
  );
}

function LockedUpgradeBox() {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/10 p-6 text-center">
      <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">
        Want to see full voyage details?
      </div>
      <div className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mb-4 max-w-xs mx-auto">
        Unlock real-time tracking, historical data, and advanced insights.
      </div>
      <Link
        href="/subscriptions"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
      >
        Upgrade Plan
      </Link>
    </div>
  );
}

function BusinessesCard({
  title,
  items,
}: {
  title: string;
  items: Business[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
      <div className="px-5 pt-4 pb-3 text-sm font-semibold text-gray-900 dark:text-white flex justify-between items-center">
        {title}
        <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <div className="px-3">
        {items.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-white/5">
            {items.slice(0, 6).map((b, i) => (
              <li
                key={i}
                className="px-2 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <Link
                  href={b.href || "#"}
                  className="flex items-start gap-3 group"
                >
                  {b.logoUrl ? (
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      className="w-9 h-9 rounded-lg object-contain ring-1 ring-black/5 bg-white shadow-sm"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 ring-1 ring-black/5 flex items-center justify-center text-gray-400 text-xs">
                      {b.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate transition-colors">
                      {b.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {b.category || "Marine Services"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-sm text-center text-gray-500 dark:text-gray-400">
            No businesses found here.
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5">
        <Link
          href="#"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          View all businesses &rarr;
        </Link>
      </div>
    </div>
  );
}

function NearVesselCard({ items }: { items: Business[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow-sm h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 text-sm font-semibold text-gray-900 dark:text-white">
        Near the vessel
      </div>
      <div className="flex-1 px-5 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No service providers detected nearby.
          </p>
        </div>
      </div>
    </div>
  );
}
