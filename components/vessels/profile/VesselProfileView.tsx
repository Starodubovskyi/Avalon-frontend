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
    "rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow";

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
                className="absolute top-3 right-3 px-3 py-1.5 text-xs sm:text-sm rounded-md border border-gray-300 bg-white/90 hover:bg-white dark:border-white/10 dark:bg-neutral-900/80 dark:hover:bg-neutral-900 text-gray-700 dark:text-gray-100"
              >
                View on live map
              </Link>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-white/10">
              <div className="text-sm">
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Current voyage
                </div>

                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-700 hover:underline dark:text-blue-300">
                    {fromLabel}
                  </span>
                  <span className="text-blue-700 hover:underline dark:text-blue-300">
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

                  <VoyageProgress
                    percent={progressPercent}
                    className="text-blue-600 dark:text-blue-400"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600 dark:text-gray-300 gap-2">
                    <div>
                      <div className="opacity-80">
                        Actual time of departure:
                      </div>
                      <div>—</div>
                    </div>
                    <div>
                      <div className="opacity-80">
                        Predicted time of arrival:
                      </div>
                      <div>{dash(vessel.reportedETA)}</div>
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

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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

        <div className="space-y-5">
          <div className={`${card} p-4`}>
            <h3 className="text-sm font-semibold mb-3">Summary</h3>

            <div className="mb-3">
              <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                Where is the ship?
              </div>
              <p className="text-[13px] text-gray-700 dark:text-gray-300">
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
              <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                What kind of ship is this?
              </div>
              <p className="text-[13px] text-gray-700 dark:text-gray-300">
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
            <div className={`${card} overflow-hidden`}>
              <div className="relative">
                <img
                  src={vessel.photoUrl}
                  alt={vessel.name}
                  className="w-full h-56 sm:h-64 md:h-72 object-cover"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button className="px-3 py-1.5 rounded-md text-xs sm:text-sm bg-white/90 border border-gray-300 hover:bg-white dark:bg-neutral-900/80 dark:border-white/10 dark:hover:bg-neutral-900">
                    Upload a photo
                  </button>
                  <button className="px-3 py-1.5 rounded-md text-xs sm:text-sm bg-white/90 border border-gray-300 hover:bg-white dark:bg-neutral-900/80 dark:border-white/10 dark:hover:bg-neutral-900">
                    View all
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={`${card} p-4`}>
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
            <div className="mt-3">
              <button className="px-3 py-1.5 rounded-md text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white">
                AIS Station
              </button>
            </div>
          </div>

          <div className={`${card} p-4`}>
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
            <div className="mt-3">
              <Link
                href="/upgrade"
                className="text-sm text-blue-700 hover:underline dark:text-blue-300"
              >
                Upgrade to global AIS coverage
              </Link>
            </div>
          </div>

          <div className={`${card} p-4`}>
            <h3 className="text-sm font-semibold mb-3">Notes</h3>
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/40 p-5 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Locked content
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                Upgrade your account to unlock this
              </div>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm shadow"
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
    <div className="grid grid-cols-3 gap-3 py-1">
      <dt className="col-span-1 text-gray-500 dark:text-gray-400">{k}</dt>
      <dd
        className={[
          "col-span-2",
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
    <div className={`relative my-4 h-10 ${className}`}>
      <div className="absolute left-8 right-8 top-[22px] h-[4px] rounded-full bg-blue-200/80 dark:bg-blue-900/40" />
      <div
        className="absolute left-8 top-[22px] h-[4px] rounded-full bg-blue-600 dark:bg-blue-400"
        style={{ width: `calc((100% - 4rem) * ${p})` }}
      />
      <div
        className="absolute top-[22px] right-8 h-[4px]"
        style={{
          left: `calc(${leftGap} + (100% - 4rem) * ${p})`,
          backgroundImage:
            "radial-gradient(currentColor 1.2px, transparent 1.2px)",
          backgroundSize: "10px 4px",
          backgroundRepeat: "repeat-x",
          opacity: 0.9,
        }}
      />
      <span className="absolute left-2 top-[20px] w-3.5 h-3.5 rounded-full bg-current ring-4 ring-blue-300/40 animate-pulse" />
      <span
        className="absolute top-[18px] -translate-x-1/2"
        style={{ left: `calc(${leftGap} + (100% - 4rem) * ${p})` }}
      >
        <span className="block w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-current" />
      </span>
      <span
        className="absolute top-[14px] -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 shadow ring-4 ring-blue-500/60"
        style={{ left: `calc(${leftGap} + (100% - 4rem) * ${p})` }}
        aria-label={`${Math.round(p * 100)}% of voyage`}
        title={`${Math.round(p * 100)}%`}
      />
      <MapPin className="absolute right-2 top-[16px] w-5 h-5 text-current" />
    </div>
  );
}

function EnterpriseVoyageTables({ vessel }: { vessel: PublicVessel }) {
  const cell =
    "py-2 text-[13px] border-t border-gray-200/70 dark:border-white/10 flex items-baseline justify-between gap-3";
  const wrap =
    "rounded-xl bg-gray-50 border border-gray-200/70 p-4 dark:bg-white/[0.04] dark:border-white/10";
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={wrap}>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Voyage progress - Current position
        </div>
        <div className={cell}>
          <span className="text-gray-500">Vessel's current load condition</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Vessel's current draught</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Vessel's current speed</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Total voyage distance</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Time to destination</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Distance travelled</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Distance to go</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Wind speed / direction</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Air temperature</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
      </div>

      <div className={wrap}>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Arrival details
        </div>
        <div className={cell}>
          <span className="text-gray-500">Arrival location</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(vessel.destinationPort || vessel.reportedDestination)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Estimated time of arrival</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Predicted time of arrival</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(vessel.reportedETA)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">
            Estimated vs predicted time of arrival
          </span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Current wind speed / direction</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
        <div className={cell}>
          <span className="text-gray-500">Current air temperature</span>
          <span className="text-gray-900 dark:text-gray-100">
            {dash(undefined)}
          </span>
        </div>
      </div>
    </div>
  );
}

function LockedUpgradeBox() {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/40 p-5 sm:p-6 text-center">
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Locked content
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
        Upgrade your account to unlock this
      </div>
      <Link
        href="/subscriptions"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm shadow"
      >
        Upgrade
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
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow">
      <div className="px-4 pt-3 pb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </div>
      <div className="px-2">
        {items.length > 0 ? (
          <ul className="divide-y divide-gray-200/80 dark:divide-white/10">
            {items.slice(0, 6).map((b, i) => (
              <li key={i} className="px-2 py-3">
                <Link
                  href={b.href || "#"}
                  className="flex items-start gap-3 group"
                >
                  {b.logoUrl ? (
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      className="w-8 h-8 rounded object-contain ring-1 ring-black/10 bg-white"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded bg-gray-100 dark:bg-white/10 ring-1 ring-black/10" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm text-blue-700 group-hover:underline dark:text-blue-300 truncate">
                      {b.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {b.category || "—"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400">
            No data available at the moment
          </div>
        )}
      </div>
      <div className="px-4 py-3">
        <Link
          href="#"
          className="text-sm text-blue-700 hover:underline dark:text-blue-300"
        >
          View full list
        </Link>
      </div>
    </div>
  );
}

function NearVesselCard({ items }: { items: Business[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow">
      <div className="px-4 pt-3 pb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
        Near the vessel
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No data available at the moment
        </div>
      </div>
    </div>
  );
}
