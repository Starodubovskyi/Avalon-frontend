"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

const toAlpha2 = (val?: string) => {
  if (!val) return "";
  const s = val.trim();
  if (s.length === 2) return s.toLowerCase();
  const c = countries.getAlpha2Code(s, "en");
  return (c || "").toLowerCase();
};
const flagUrl = (a2: string) =>
  a2 ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${a2}.svg` : "";

export type PortHeaderProps = {
  id: string;
  port: string;
  country?: string;
  flagEmoji?: string;
  flagAlpha2?: string;
  unlocode?: string;
};

const NAV_TABS = [
  { slug: "", label: "Overview" },
  { slug: "arrivals", label: "Arrivals" },
  { slug: "departures", label: "Departures" },
  { slug: "anchorage", label: "Anchorage" },
  { slug: "vessels", label: "Vessels" },
] as const;

export default function PortProfileHeader({
  id,
  port,
  country,
  flagEmoji,
  flagAlpha2,
  unlocode,
}: PortHeaderProps) {
  const pathname = usePathname();
  const a2 = (flagAlpha2 || toAlpha2(country) || "").toLowerCase();
  const f = flagUrl(a2);

  return (
    <div className="mt-5 sm:mt-6 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {flagEmoji ? (
          <span className="text-2xl leading-none">{flagEmoji}</span>
        ) : a2 ? (
          <img
            src={f}
            alt={country || a2.toUpperCase()}
            className="w-6 h-5 rounded-sm ring-1 ring-black/10"
          />
        ) : (
          <span className="w-6 h-6 rounded-sm bg-gray-200 dark:bg-white/10 inline-block" />
        )}

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {port}
        </h1>

        {unlocode && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            UNLOCODE: {unlocode}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-gray-200 bg-white px-2 py-2 dark:bg-white/5 dark:border-white/10">
        {NAV_TABS.map(({ slug, label }) => {
          const href = slug ? `/ports/${id}/${slug}` : `/ports/${id}`;
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
