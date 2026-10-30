"use client";

import { useEffect, useState } from "react";
import type { Port, PortStatus } from "@/lib/api/ports";

export const PORT_STATUSES: PortStatus[] = ["Open", "Congested", "Closed"];

/** Typed view of the loosely-typed client record */
export interface PortRow {
  id: string;
  name: string;
  unlocode: string;
  country: string;
  status: PortStatus;
  timezone: string;
  lat: number | null;
  lng: number | null;
}

function asStatus(raw: unknown): PortStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("congest")) return "Congested";
  if (s.includes("close")) return "Closed";
  return "Open";
}

function asNumber(raw: unknown): number | null {
  const n = typeof raw === "string" && raw.trim() ? Number(raw) : raw;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export function toPortRow(p: Port): PortRow {
  const country: unknown = p.country ?? p.flag;
  const timezone: unknown = p.timezone;
  return {
    id: p.id,
    name: p.name || p.unlocode,
    unlocode: p.unlocode,
    country: typeof country === "string" ? country.trim() : "",
    status: asStatus(p.status),
    timezone: typeof timezone === "string" && timezone.trim() ? timezone.trim() : "UTC",
    lat: asNumber(p.lat),
    lng: asNumber(p.lng),
  };
}

const ISO2 = /^[A-Za-z]{2}$/;

/** "RO" → 🇷🇴 (regional indicator pair); anything else → empty */
export function flagEmoji(code: string): string {
  if (!ISO2.test(code)) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(...code.toUpperCase().split("").map((c) => base + c.charCodeAt(0) - 65));
}

let regionNames: Intl.DisplayNames | null | undefined;

export function countryName(code: string): string {
  if (!ISO2.test(code)) return code;
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      regionNames = null;
    }
  }
  try {
    return regionNames?.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const timeFormatters = new Map<string, Intl.DateTimeFormat | null>();

function formatterFor(tz: string): Intl.DateTimeFormat | null {
  if (!timeFormatters.has(tz)) {
    try {
      timeFormatters.set(
        tz,
        new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", timeZoneName: "shortOffset" }),
      );
    } catch {
      timeFormatters.set(tz, null);
    }
  }
  return timeFormatters.get(tz) ?? null;
}

/** Local wall-clock time and UTC offset in a port's zone, or null for an unknown zone */
export function localTime(tz: string, now: number): { time: string; offset: string } | null {
  const fmt = formatterFor(tz);
  if (!fmt) return null;
  const parts = fmt.formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return { time: `${pick("hour")}:${pick("minute")}`, offset: pick("timeZoneName") || "GMT" };
}

export function fmtCoord(value: number, axis: "lat" | "lng"): string {
  const hemi = axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(4)}° ${hemi}`;
}

let zoneList: string[] | null = null;

export function allTimezones(): string[] {
  if (zoneList) return zoneList;
  try {
    zoneList = Intl.supportedValuesOf("timeZone");
  } catch {
    zoneList = ["UTC", "Europe/Bucharest", "Europe/Kyiv", "Europe/Chisinau", "Europe/Istanbul"];
  }
  return zoneList;
}

/** One shared ticking clock for live local times */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
