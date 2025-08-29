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
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        {a2 && imgOk ? (
          <img
            src={svg}
            alt={label}
            className="w-6 h-4 rounded-[2px] ring-1 ring-black/10"
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : flagEmoji ? (
          <span className="text-2xl leading-none">{flagEmoji}</span>
        ) : (
          <span className="w-6 h-4 rounded-sm bg-gray-200 dark:bg-white/10 inline-block" />
        )}

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {name}
        </h1>

        {type && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {type}
          </span>
        )}

        {imo && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            IMO: {imo}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-gray-200 bg-white px-2 py-2 dark:bg-white/5 dark:border-white/10">
        {NAV_TABS.map(({ slug, label }) => {
          const href = slug ? `/vessels/${id}/${slug}` : `/vessels/${id}`;
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "whitespace-nowrap px-4 h-9 inline-flex items-center rounded-full text-sm transition-all",
                active
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
