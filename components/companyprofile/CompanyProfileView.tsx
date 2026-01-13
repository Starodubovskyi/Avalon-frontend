"use client";

import {
  Anchor,
  ExternalLink,
  Calendar,
  Users,
  Mail,
  MapPin,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import type { Company } from "@/components/types/company.types";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

const DefaultIcon = L.icon({
  iconUrl: typeof icon === "string" ? icon : icon.src,
  shadowUrl: typeof iconShadow === "string" ? iconShadow : iconShadow.src,
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CompanyProfileView({ company }: { company: Company }) {
  return (
    <div className="w-full space-y-8">
      {/* Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
        <div className="h-64 w-full bg-gray-100 dark:bg-[#121212]">
          {company.bannerUrl ? (
            <img
              src={company.bannerUrl}
              alt="Company Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[#121212] dark:to-[#1a1a1a]" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col sm:flex-row items-end justify-between gap-6">
          <div className="flex items-end gap-6">
            <div className="w-28 h-28 rounded-[2rem] border-4 border-white dark:border-[#0d1117] bg-white dark:bg-[#0d1117] overflow-hidden flex items-center justify-center shadow-xl shrink-0">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={clsx(
                    "w-full h-full flex items-center justify-center text-white",
                    GRADIENT_BG
                  )}
                >
                  <Anchor className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="text-white pb-2">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                {company.businessName}
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.activity && (
                  <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-sm font-medium">
                    {company.activity}
                  </span>
                )}
                {company.tagline && (
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                      GRADIENT_BG
                    )}
                  >
                    {company.tagline}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex gap-3 pb-2">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white text-gray-900 px-5 py-2.5 text-sm font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
              >
                <ExternalLink size={16} /> Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm p-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              About Company
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {company.description || "No description provided."}
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm p-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <InfoRow label="Legal Name" value={company.legalName} />
              <InfoRow
                label="Founded"
                value={company.founded}
                icon={<Calendar size={14} />}
              />
              <InfoRow
                label="Employees"
                value={company.employees}
                icon={<Users size={14} />}
              />
              <InfoRow
                label="Email"
                value={company.email}
                icon={<Mail size={14} />}
              />
              <InfoRow label="Serviced Ports" value={company.servicedPorts} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <MapPin className="text-red-500" /> Headquarters
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
              {company.address} {company.city ? `, ${company.city}` : ""}{" "}
              {company.country ? `• ${company.country}` : ""}
            </div>
            <div className="rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 w-full h-[300px]">
              <MapContainer
                center={[company.lat, company.lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[company.lat, company.lng]}>
                  <Popup>{company.businessName}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-2 w-40 shrink-0 text-gray-500 dark:text-gray-400 text-sm font-medium">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}:
      </div>
      <div className="flex-1 text-gray-900 dark:text-gray-200 text-sm font-medium truncate">
        {value || <span className="opacity-50">—</span>}
      </div>
    </div>
  );
}
