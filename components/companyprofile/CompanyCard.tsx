"use client";

import Link from "next/link";
import {
  User,
  ExternalLink,
  MapPin,
  Plus,
  HelpCircle,
  Anchor,
  Mail,
  Calendar,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";

import { Company } from "@/components/types/company.types";
import { LineUpItem, TeamMember } from "./CompaniRegistation/form/types";
import ManageTeamModal from "./manage/ManageTeamModal";
import ManageLineUpModal from "./manage/ManageLineUpModal";
import { getMapboxToken } from "@/lib/map/getMapboxToken";

mapboxgl.accessToken = getMapboxToken();

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";
const GRADIENT_TEXT =
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent";

function initials(first?: string, last?: string) {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const i1 = f ? f[0] : "";
  const i2 = l ? l[0] : "";
  const res = (i1 + i2).toUpperCase();
  return res || "•";
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
        {value ?? <span className="opacity-50">—</span>}
      </div>
    </div>
  );
}

type Props = {
  company: Company;
  canManage?: boolean;
  onUpdateCompany?: (next: Company) => void;
};

type FieldType = "text" | "number" | "date" | "datetime" | "select" | "yesno";
type FieldDef = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  hiddenInList?: boolean;
};
type AnyLineUpItem = LineUpItem & {
  custom?: Record<string, any>;
  schema?: FieldDef[];
};

function formatValueByType(type: FieldType, value: any) {
  if (value === undefined || value === null || value === "") return "";
  switch (type) {
    case "number": {
      const n = typeof value === "number" ? value : Number(value);
      return Number.isFinite(n) ? n.toLocaleString() : String(value);
    }
    case "datetime":
      return String(value).replace("T", " ");
    case "date":
    case "select":
    case "yesno":
    case "text":
    default:
      return String(value);
  }
}

function schemaSignature(schema?: FieldDef[]) {
  if (!schema || schema.length === 0) return "base-only";
  return schema.map((f) => `${f.key}:${f.type}:${f.label}`).join("|");
}

export default function CompanyCard({
  company,
  canManage = false,
  onUpdateCompany,
}: Props) {
  const { resolvedTheme } = useTheme();
  const team = (((company as any)?.team as TeamMember[]) || []).filter(Boolean);
  const lineup = (((company as any)?.lineup as LineUpItem[]) || []).filter(
    Boolean,
  ) as AnyLineUpItem[];

  const [openTeam, setOpenTeam] = useState(false);
  const [openLineup, setOpenLineup] = useState(false);

  // --- Mapbox Logic for Sidebar ---
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const style =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: style,
      center: [company.lng || 0, company.lat || 0],
      zoom: 13,
      interactive: false, // Static map usually fits better in small cards
      attributionControl: false,
    });

    // Add Marker
    new mapboxgl.Marker({ color: "red" })
      .setLngLat([company.lng || 0, company.lat || 0])
      .setPopup(new mapboxgl.Popup().setHTML(`<b>${company.businessName}</b>`))
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [company.lat, company.lng, company.businessName, resolvedTheme]);

  // Update style on theme change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const style =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";
    mapInstanceRef.current.setStyle(style);
  }, [resolvedTheme]);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { schema: FieldDef[]; items: AnyLineUpItem[]; title: string }
    >();
    for (const it of lineup) {
      const sig = schemaSignature(it.schema);
      if (!map.has(sig)) {
        map.set(sig, {
          schema: it.schema || [],
          items: [],
          title:
            (it.schema && it.schema.length
              ? it.schema.map((f) => f.label).join(" / ")
              : "Base fields only") || "Base fields only",
        });
      }
      map.get(sig)!.items.push(it);
    }
    return Array.from(map.values());
  }, [lineup]);

  return (
    <div className="w-full space-y-8">
      {/* Banner & Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl shadow-black/5">
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col sm:flex-row items-end justify-between gap-6">
          <div className="flex items-end gap-6">
            <div className="w-28 h-28 rounded-[2rem] border-4 border-white dark:border-[#0d1117] bg-white dark:bg-[#0d1117] overflow-hidden flex items-center justify-center shadow-xl shrink-0">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={clsx(
                    "w-full h-full flex items-center justify-center text-white",
                    GRADIENT_BG,
                  )}
                >
                  <Anchor className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="text-white pb-1">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                {company.businessName}
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.activity && (
                  <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 text-sm font-medium">
                    {company.activity}
                  </span>
                )}
                {company.tagline && (
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white",
                      GRADIENT_BG,
                    )}
                  >
                    {company.tagline}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pb-1">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white text-gray-900 px-5 py-2.5 text-sm font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm p-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              About Company
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {company.description || "No description provided."}
            </p>
          </div>

          {/* Details */}
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

          {/* Team */}
          <div className="rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <User className="text-blue-500" /> Team
              </h3>
              <div className="flex items-center gap-3">
                <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">
                  {team.length} members
                </span>
                {canManage && onUpdateCompany && (
                  <button
                    onClick={() => setOpenTeam(true)}
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                  >
                    <Plus size={14} /> Add Member
                  </button>
                )}
              </div>
            </div>

            {team.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-gray-500">
                No team members yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-4 rounded-[2rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                      {(m as any).avatarUrl ? (
                        <img
                          src={(m as any).avatarUrl}
                          alt={`${m.firstName} ${m.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={clsx(
                            "w-full h-full grid place-items-center text-white text-sm font-bold",
                            GRADIENT_BG,
                          )}
                        >
                          {initials(m.firstName, m.lastName)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-white truncate">
                        {m.firstName} {m.lastName}
                        {(m as any).isDeputy && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold uppercase tracking-wider">
                            Deputy
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {m.role}
                      </div>
                    </div>
                    {(m as any).profileUrl && (
                      <a
                        href={(m as any).profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Line-Up */}
          <div className="rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <MapPin className="text-blue-500" /> Line-Up
              </h3>

              <div className="flex items-center gap-3">
                <Link
                  href="/guide"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
                >
                  <HelpCircle size={20} />
                </Link>

                <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">
                  {lineup.length} items
                </span>

                {canManage && onUpdateCompany && (
                  <button
                    onClick={() => setOpenLineup(true)}
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                  >
                    <Plus size={14} /> Add Line-Up
                  </button>
                )}
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-gray-500">
                No items yet.
              </div>
            ) : (
              <div className="space-y-8">
                {groups.map((g, gi) => {
                  const baseCols = [
                    { key: "name", label: "Vessel" },
                    { key: "imo", label: "IMO" },
                    { key: "port", label: "Port" },
                    { key: "window", label: "Date Window" },
                    { key: "notes", label: "Notes" },
                  ] as const;

                  const extraKeys = (() => {
                    const known = new Set((g.schema || []).map((f) => f.key));
                    const acc = new Set<string>();
                    for (const it of g.items) {
                      Object.keys(it.custom || {}).forEach((k) => {
                        if (!known.has(k)) acc.add(k);
                      });
                    }
                    return Array.from(acc).sort();
                  })();

                  return (
                    <div key={gi}>
                      <div className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        {g.title}
                      </div>
                      <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 dark:border-white/5">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5">
                              <tr className="text-left">
                                {baseCols.map((c) => (
                                  <th
                                    key={c.key}
                                    className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
                                  >
                                    {c.label}
                                  </th>
                                ))}
                                {g.schema.map((f) => (
                                  <th
                                    key={f.key}
                                    className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
                                  >
                                    {f.label}
                                  </th>
                                ))}
                                {extraKeys.map((k) => (
                                  <th
                                    key={`x-${k}`}
                                    className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
                                  >
                                    {k}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                              {g.items.map((row) => (
                                <tr
                                  key={row.id}
                                  className="bg-white dark:bg-[#0d1117] hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors"
                                >
                                  {baseCols.map((c) => {
                                    const val = (row as any)[c.key];
                                    return (
                                      <td
                                        key={`${row.id}-${c.key}`}
                                        className="px-4 py-3 text-gray-600 dark:text-gray-300 align-top"
                                      >
                                        {!val ? (
                                          <span className="opacity-30">—</span>
                                        ) : c.key === "notes" ? (
                                          <span className="line-clamp-2">
                                            {String(val)}
                                          </span>
                                        ) : (
                                          String(val)
                                        )}
                                      </td>
                                    );
                                  })}
                                  {g.schema.map((f) => {
                                    const val = formatValueByType(
                                      f.type,
                                      row.custom?.[f.key],
                                    );
                                    return (
                                      <td
                                        key={`${row.id}-${f.key}`}
                                        className="px-4 py-3 text-gray-600 dark:text-gray-300 align-top"
                                      >
                                        {!val ? (
                                          <span className="opacity-30">—</span>
                                        ) : (
                                          val
                                        )}
                                      </td>
                                    );
                                  })}
                                  {extraKeys.map((k) => {
                                    const val = row.custom?.[k];
                                    return (
                                      <td
                                        key={`${row.id}-x-${k}`}
                                        className="px-4 py-3 text-gray-600 dark:text-gray-300 align-top"
                                      >
                                        {!val ? (
                                          <span className="opacity-30">—</span>
                                        ) : (
                                          String(val)
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Headquarters Map) */}
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm p-8 sticky top-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={20} className="text-red-500" />
              Headquarters
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
              {company.address}
              {company.city ? `, ${company.city}` : ""}{" "}
              {company.country ? `• ${company.country}` : ""}
            </div>

            {/* --- Mapbox Container --- */}
            <div className="rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 w-full h-[300px] shadow-inner relative">
              <div
                ref={mapContainerRef}
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <ManageTeamModal
        open={openTeam}
        onClose={() => setOpenTeam(false)}
        initialTeam={(company as any).team || []}
        onSave={(nextTeam) =>
          onUpdateCompany?.({ ...(company as any), team: nextTeam })
        }
      />
      <ManageLineUpModal
        open={openLineup}
        onClose={() => setOpenLineup(false)}
        initialLineup={(company as any).lineup || []}
        onSave={(nextLineup) =>
          onUpdateCompany?.({ ...(company as any), lineup: nextLineup })
        }
      />
    </div>
  );
}
