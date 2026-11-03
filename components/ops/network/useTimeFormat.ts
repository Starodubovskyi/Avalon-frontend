"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";

const DAY_MS = 86_400_000;

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Locale-aware stamps for chat, feed, requests, documents and team (interface language + Europe/Bucharest).
 * Replaces the en-GB helpers of lib/network/format and lib/vessels/format inside these sections.
 */
export function useTimeFormat() {
  const format = useFormatter();
  const t = useTranslations("chat.time");

  return useMemo(() => {
    /** Calendar day in the app time zone — the same zone the labels are printed in */
    const dayKey = (d: Date) => format.dateTime(d, { year: "numeric", month: "2-digit", day: "2-digit" });

    /** 0 = today, 1 = yesterday … 7 = a week or more ago */
    const daysAgo = (d: Date, now: number) => {
      const key = dayKey(d);
      for (let i = 0; i < 7; i += 1) if (dayKey(new Date(now - i * DAY_MS)) === key) return i;
      return 7;
    };

    const date = (iso: string | null | undefined) => {
      const d = parse(iso);
      return d ? format.dateTime(d, { day: "2-digit", month: "short" }) : "—";
    };

    return {
      dayKey: (iso: string) => {
        const d = parse(iso);
        return d ? dayKey(d) : "unknown";
      },
      /** 14:05 */
      clock: (iso: string | null | undefined) => {
        const d = parse(iso);
        return d ? format.dateTime(d, { hour: "2-digit", minute: "2-digit" }) : "";
      },
      /** 3 Nov 2026, 14:05 — tooltips */
      full: (iso: string | null | undefined) => {
        const d = parse(iso);
        return d ? format.dateTime(d, { dateStyle: "medium", timeStyle: "short" }) : "";
      },
      /** 03 Nov */
      date,
      /** 03 Nov 2026 */
      dateYear: (iso: string | null | undefined) => {
        const d = parse(iso);
        return d ? format.dateTime(d, { day: "2-digit", month: "short", year: "numeric" }) : "—";
      },
      /** 03 Nov, 14:05 */
      dateTime: (iso: string | null | undefined) => {
        const d = parse(iso);
        return d ? format.dateTime(d, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
      },
      /** 5 minutes ago; under a minute (or a server clock slightly ahead) reads "just now" */
      relative: (iso: string | null | undefined, now: number) => {
        const d = parse(iso);
        if (!d) return "—";
        return now - d.getTime() < 60_000 && d.getTime() - now < 60_000 ? t("justNow") : format.relativeTime(d, now);
      },
      /** Conversation list: 14:05 · Yesterday · Mon · 12 Oct */
      listTime: (iso: string | null | undefined, now: number) => {
        const d = parse(iso);
        if (!d) return "";
        const days = daysAgo(d, now);
        if (days === 0) return format.dateTime(d, { hour: "2-digit", minute: "2-digit" });
        if (days === 1) return t("yesterday");
        if (days < 7) return format.dateTime(d, { weekday: "short" });
        return date(iso);
      },
      /** Day separator in a dialog: Today · Yesterday · Monday, 12 October */
      dayLabel: (iso: string, now: number) => {
        const d = parse(iso);
        if (!d) return "";
        const days = daysAgo(d, now);
        if (days === 0) return t("today");
        if (days === 1) return t("yesterday");
        const sameYear = format.dateTime(d, { year: "numeric" }) === format.dateTime(new Date(now), { year: "numeric" });
        return sameYear
          ? format.dateTime(d, { weekday: "long", day: "numeric", month: "long" })
          : format.dateTime(d, { day: "numeric", month: "long", year: "numeric" });
      },
      /** Feed: relative for a week, then the date */
      feedTime: (iso: string | null | undefined, now: number) => {
        const d = parse(iso);
        if (!d) return "";
        const age = now - d.getTime();
        if (age < 60_000) return t("justNow");
        return age < 7 * DAY_MS ? format.relativeTime(d, now) : date(iso);
      },
      /** 820 B · 14 kB · 1.2 MB in the interface language */
      bytes: (n: number) => {
        if (n < 1024) return format.number(n, { style: "unit", unit: "byte" });
        if (n < 1024 * 1024) return format.number(Math.round(n / 1024), { style: "unit", unit: "kilobyte" });
        return format.number(n / 1024 / 1024, { style: "unit", unit: "megabyte", maximumFractionDigits: 1 });
      },
    };
  }, [format, t]);
}

export type TimeFormat = ReturnType<typeof useTimeFormat>;
