"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

type Slug =
  | ""
  | "port-calls"
  | "characteristics"
  | "ownership"
  | "performance"
  | "compliance"
  | "news";

export type VesselHeaderProps = {
  id: string;
  name: string;
  type?: string;
  imo?: string;

  flagEmoji?: string;
  flag?: string;
  country?: string;
  flagAlpha2?: string;
};

const NAV_TABS: { slug: Slug; label: string }[] = [
  { slug: "", label: "Overview" },
  { slug: "port-calls", label: "Port call log" },
  { slug: "characteristics", label: "Vessel characteristics" },
  { slug: "ownership", label: "Ownership" },
  { slug: "performance", label: "Performance insights" },
  { slug: "compliance", label: "Compliance" },
  { slug: "news", label: "In the news" },
];

const RI_BASE = 0x1f1e6;
function toCodePoints(str: string): number[] {
  const cps: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const hi = str.charCodeAt(i);
    if (hi >= 0xd800 && hi <= 0xdbff && i + 1 < str.length) {
      const lo = str.charCodeAt(++i);
      cps.push(((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000);
    } else cps.push(hi);
  }
  return cps;
}
function emojiToAlpha2(emoji?: string): string | undefined {
  if (!emoji) return;
  const cps = toCodePoints(emoji).filter(
    (cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff
  );
  if (cps.length < 2) return;
  const a = String.fromCharCode(cps[0] - RI_BASE + 0x41);
  const b = String.fromCharCode(cps[1] - RI_BASE + 0x41);
  const code = `${a}${b}`.toLowerCase();
  return /^[a-z]{2}$/.test(code) ? code : undefined;
}
function nameToAlpha2(val?: string): string {
  if (!val) return "";
  const s = val.trim();
  if (/^[A-Za-z]{2}$/.test(s)) return s.toLowerCase();
  const c = countries.getAlpha2Code(s, "en");
  return (c || "").toLowerCase();
}
const flagUrl = (a2?: string) =>
  a2 ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${a2}.svg` : "";

export default function VesselProfileHeader({
  id,
  name,
  type,
  imo,
  flagEmoji,
  flag,
  country,
  flagAlpha2,
}: VesselHeaderProps) {
  const pathname = usePathname();

  const a2 = useMemo(() => {
    const fromProp =
      flagAlpha2 && /^[a-z]{2}$/i.test(flagAlpha2)
        ? flagAlpha2.toLowerCase()
        : "";
    return (
      fromProp ||
      emojiToAlpha2(flagEmoji || "") ||
      nameToAlpha2(flag || country || "")
    );
  }, [flagAlpha2, flagEmoji, flag, country]);

  const [imgOk, setImgOk] = useState(true);
  const svg = flagUrl(a2);
  const label = country || flag || flagEmoji || (a2 ? a2.toUpperCase() : "");

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        {a2 && imgOk ? (
          <img
            src={svg}
            alt={label}
            className="w-8 h-6 rounded-[3px] ring-1 ring-black/10 shadow-sm"
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : flagEmoji ? (
          <span className="text-3xl leading-none">{flagEmoji}</span>
        ) : (
          <span className="w-8 h-6 rounded bg-gray-200 dark:bg-white/10 inline-block" />
        )}

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {name}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          {type && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
              {type}
            </span>
          )}

          {imo && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5">
              IMO: {imo}
            </span>
          )}
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar rounded-full border border-gray-200 bg-white px-2 py-2 dark:bg-white/5 dark:border-white/10">
          {NAV_TABS.map(({ slug, label }) => {
            const href = slug ? `/vessels/${id}/${slug}` : `/vessels/${id}`;
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "whitespace-nowrap px-5 h-9 inline-flex items-center rounded-full text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/10",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
