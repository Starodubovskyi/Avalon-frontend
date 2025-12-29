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
    <div className="mt-6 sm:mt-8 mb-6">
      <div className="flex items-center gap-3 mb-5">
        {flagEmoji ? (
          <span className="text-3xl leading-none">{flagEmoji}</span>
        ) : a2 ? (
          <img
            src={f}
            alt={country || a2.toUpperCase()}
            className="w-8 h-6 rounded-[3px] ring-1 ring-black/10 shadow-sm"
          />
        ) : (
          <span className="w-8 h-6 rounded bg-gray-200 dark:bg-white/10 inline-block" />
        )}

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {port}
        </h1>

        {unlocode && (
          <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 mt-1">
            UNLOCODE: {unlocode}
          </span>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar rounded-full border border-gray-200 bg-white px-2 py-2 dark:bg-white/5 dark:border-white/10">
          {NAV_TABS.map(({ slug, label }) => {
            const href = slug ? `/ports/${id}/${slug}` : `/ports/${id}`;
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
