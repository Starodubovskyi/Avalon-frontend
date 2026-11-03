/** Interface languages. English is the default and the fallback for any missing key. */
export const LOCALES = ["en", "ru", "ro"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE = "AVALON_LOCALE";
/** Dates and times on the Danube (Sulina, Galați, Izmail, Reni) */
export const APP_TIME_ZONE = "Europe/Bucharest";

export const LOCALE_LABEL: Record<AppLocale, { short: string; name: string }> =
  {
    en: { short: "EN", name: "English" },
    ru: { short: "RU", name: "Русский" },
    ro: { short: "RO", name: "Română" },
  };

export function isLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
