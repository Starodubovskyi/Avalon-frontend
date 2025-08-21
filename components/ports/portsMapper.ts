import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
countries.registerLocale(en as any);

const toAlpha2 = (val?: string) => {
  if (!val) return "";
  const s = val.trim();
  if (s.length === 2) return s.toLowerCase();
  const c = countries.getAlpha2Code(s, "en");
  return (c || "").toLowerCase();
};
const flagUrl = (a2: string) =>
  a2 ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${a2}.svg` : "";

export function mapMarineTrafficPort(row: any) {
  const a2 = toAlpha2(row?.flag || row?.country);
  return {
    id: String(row?.id ?? row?.unlocode ?? crypto.randomUUID()),
    port: row?.portname ?? row?.port ?? "",
    unlocode: row?.unlocode ?? "",
    country: row?.country ?? row?.flag ?? "",
    photoUrl: row?.photo ?? row?.photo_url ?? "",
    vessels: row?.vessels_in_port ?? row?.vessels ?? 0,
    departures: row?.vessels_departures ?? row?.departures ?? 0,
    arrivals: row?.vessels_arrivals ?? row?.arrivals ?? 0,
    expectedArrivals:
      row?.vessels_expected_arrivals ?? row?.expectedArrivals ?? 0,
    timezone: row?.local_time ?? row?.timezone ?? "",
    anchorage: row?.anchorage ?? "",
    geoArea1: row?.geographical_area_one ?? row?.area1 ?? "",
    geoArea2: row?.geographical_area_two ?? row?.area2 ?? "",
    coverage: row?.coverage ?? "",
    countryFlag: row?.countryFlag || flagUrl(a2),
  };
}

export function mapMarineTrafficPorts(rows: any[] = []) {
  return rows.map(mapMarineTrafficPort);
}
