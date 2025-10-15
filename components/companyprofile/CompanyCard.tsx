"use client";

import Link from "next/link";
import { FaShip } from "react-icons/fa";
import {
  FiUser,
  FiExternalLink,
  FiMapPin,
  FiPlus,
  FiHelpCircle,
} from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Company } from "@/components/types/company.types";
import { LineUpItem, TeamMember } from "./CompaniRegistation/form/types";
import ManageTeamModal from "./manage/ManageTeamModal";
import ManageLineUpModal from "./manage/ManageLineUpModal";
import { useMemo, useState } from "react";

const DefaultIcon = L.icon({
  iconUrl: typeof icon === "string" ? icon : icon.src,
  shadowUrl: typeof iconShadow === "string" ? iconShadow : iconShadow.src,
});
L.Marker.prototype.options.icon = DefaultIcon;

function initials(first?: string, last?: string) {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const i1 = f ? f[0] : "";
  const i2 = l ? l[0] : "";
  const res = (i1 + i2).toUpperCase();
  return res || "•";
}

function InfoRow({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-40 shrink-0 text-gray-500 dark:text-neutral-400">
        {label}:
      </div>
      <div className="flex-1">
        {value ?? <span className="opacity-60">—</span>}
      </div>
    </div>
  );
}

type Props = {
  company: Company;
  canManage?: boolean;
  onUpdateCompany?: (next: Company) => void;
};

/** локальные типы для чтения схемы/кастом-полей у элемента */
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
  const team = (((company as any)?.team as TeamMember[]) || []).filter(Boolean);
  const lineup = (((company as any)?.lineup as LineUpItem[]) || []).filter(
    Boolean
  ) as AnyLineUpItem[];

  const chip =
    "inline-flex items-center rounded-full border border-blue-200/80 dark:border-blue-900/50 px-2.5 py-1 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-900/30";

  const [openTeam, setOpenTeam] = useState(false);
  const [openLineup, setOpenLineup] = useState(false);

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
    <div className="w-full space-y-6">
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        <div className="h-48 w-full bg-gray-100 dark:bg-black">
          {company.bannerUrl ? (
            <img
              src={company.bannerUrl}
              alt="Company Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-black bg-white dark:bg-black overflow-hidden flex items-center justify-center shadow">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaShip className="text-3xl text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="text-white drop-shadow">
              <h2 className="text-2xl font-bold">{company.businessName}</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                {company.activity && (
                  <span className="inline-flex items-center rounded-full bg-white/90 text-gray-800 px-2.5 py-0.5 text-xs">
                    {company.activity}
                  </span>
                )}
                {company.tagline && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/90 text-white px-2.5 py-0.5 text-xs">
                    {company.tagline}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-white/90 text-gray-800 px-3 py-2 text-xs font-medium hover:bg-white transition inline-flex items-center gap-1"
              >
                <FiExternalLink />
                Visit website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-2">About Company</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {company.description || "No description provided."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-3">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-700 dark:text-gray-300">
              <InfoRow label="Legal Name" value={company.legalName} />
              <InfoRow label="Founded" value={company.founded} />
              <InfoRow label="Employees" value={company.employees} />
              <InfoRow
                label="Website"
                value={
                  company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline break-all"
                    >
                      {company.website}
                    </a>
                  ) : (
                    ""
                  )
                }
              />
              <InfoRow label="Email" value={company.email} />
              <InfoRow label="Serviced Ports" value={company.servicedPorts} />
              <InfoRow label="Tagline" value={company.tagline} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FiUser />
                Team
              </h3>
              <div className="flex items-center gap-2">
                <span className={chip}>{team.length} members</span>
                {canManage && onUpdateCompany && (
                  <button
                    onClick={() => setOpenTeam(true)}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    <FiPlus />
                    Add member
                  </button>
                )}
              </div>
            </div>

            {team.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-neutral-400">
                No team members yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {team.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 px-3 py-3"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/50 dark:border-neutral-800 shrink-0">
                      {(m as any).avatarUrl ? (
                        <img
                          src={(m as any).avatarUrl}
                          alt={`${m.firstName} ${m.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center bg-gradient-to-br from-blue-500/90 to-indigo-500/90 text-white text-sm font-semibold">
                          {initials(m.firstName, m.lastName)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {m.firstName} {m.lastName}
                        {(m as any).isDeputy ? (
                          <span className="ml-2 align-middle text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-300/60 text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-900/20">
                            deputy
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                        {m.role}
                      </div>
                    </div>
                    {(m as any).profileUrl && (
                      <a
                        href={(m as any).profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs rounded-full border border-blue-200/70 dark:border-blue-900/50 px-2.5 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 inline-flex items-center gap-1"
                        title="Open profile"
                      >
                        <FiExternalLink />
                        Profile
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FiMapPin />
                Line-Up
              </h3>

              <div className="flex items-center gap-2">
                <Link
                  href="/guide"
                  title="Help for Line-Up"
                  aria-label="Line-Up help"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
                >
                  <FiHelpCircle size={16} />
                </Link>

                <span className={chip}>{lineup.length} items</span>

                {canManage && onUpdateCompany && (
                  <button
                    onClick={() => setOpenLineup(true)}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    <FiPlus />
                    Add line-up
                  </button>
                )}
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-neutral-400">
                No items yet.
              </div>
            ) : (
              <div className="space-y-6">
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
                      <div className="mb-2 text-xs text-gray-500 dark:text-neutral-400">
                        Schema: {g.title}
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50/80 dark:bg-neutral-800/60">
                            <tr className="text-left">
                              {baseCols.map((c) => (
                                <th
                                  key={c.key}
                                  className="px-3 py-2 font-medium text-gray-600 dark:text-neutral-300 whitespace-nowrap border-b border-gray-200 dark:border-white/10"
                                >
                                  {c.label}
                                </th>
                              ))}
                              {g.schema.map((f) => (
                                <th
                                  key={f.key}
                                  className="px-3 py-2 font-medium text-gray-600 dark:text-neutral-300 whitespace-nowrap border-b border-gray-200 dark:border-white/10"
                                >
                                  {f.label}
                                </th>
                              ))}
                              {extraKeys.map((k) => (
                                <th
                                  key={`x-${k}`}
                                  className="px-3 py-2 font-medium text-gray-600 dark:text-neutral-300 whitespace-nowrap border-b border-gray-200 dark:border-white/10"
                                >
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {g.items.map((row) => (
                              <tr
                                key={row.id}
                                className="odd:bg-white even:bg-gray-50/50 dark:odd:bg-neutral-900/60 dark:even:bg-neutral-900/40 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                              >
                                {baseCols.map((c) => {
                                  const val = (row as any)[c.key];
                                  const isEmpty =
                                    val === "" ||
                                    val === undefined ||
                                    val === null;
                                  return (
                                    <td
                                      key={`${row.id}-${c.key}`}
                                      className="px-3 py-2 text-gray-800 dark:text-gray-200 align-top border-b border-gray-100 dark:border-white/5"
                                    >
                                      {isEmpty ? (
                                        <span className="opacity-50">—</span>
                                      ) : (
                                        <span
                                          className={
                                            c.key === "notes"
                                              ? "break-all"
                                              : "whitespace-nowrap"
                                          }
                                        >
                                          {String(val)}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                                {g.schema.map((f) => {
                                  const raw = row.custom?.[f.key];
                                  const val = formatValueByType(f.type, raw);
                                  const empty = val === "";
                                  return (
                                    <td
                                      key={`${row.id}-${f.key}`}
                                      className="px-3 py-2 text-gray-800 dark:text-gray-200 align-top border-b border-gray-100 dark:border-white/5"
                                    >
                                      {empty ? (
                                        <span className="opacity-50">—</span>
                                      ) : (
                                        <span className="break-all">{val}</span>
                                      )}
                                    </td>
                                  );
                                })}
                                {extraKeys.map((k) => {
                                  const v = row.custom?.[k];
                                  const empty =
                                    v === "" || v === undefined || v === null;
                                  return (
                                    <td
                                      key={`${row.id}-x-${k}`}
                                      className="px-3 py-2 text-gray-800 dark:text-gray-200 align-top border-b border-gray-100 dark:border-white/5"
                                    >
                                      {empty ? (
                                        <span className="opacity-50">—</span>
                                      ) : (
                                        <span className="break-all">
                                          {String(v)}
                                        </span>
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-3">Headquarters</h3>
            <div className="text-xs text-gray-500 dark:text-neutral-400 mb-2">
              {company.address}
              {company.city ? `, ${company.city}` : ""}{" "}
              {company.country ? `• ${company.country}` : ""}
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 w-full h-[260px]">
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
