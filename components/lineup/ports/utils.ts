import type { PortLite } from "./mockPorts";
import type { RadiusFilter } from "./state";

export function filterByAll(
  ports: PortLite[],
  q: string,
  status: Set<PortLite["status"]> | null,
  radius: RadiusFilter
): PortLite[] {
  const query = q.trim().toLowerCase();
  let res = !query
    ? ports
    : ports.filter((p) =>
        [p.name, p.country, p.unlocode].some((v) =>
          v.toLowerCase().includes(query)
        )
      );

  if (status && status.size) res = res.filter((p) => status.has(p.status));

  if (radius && radius.center && radius.km > 0) {
    const { lat, lng } = radius.center;
    res = res.filter((p) => haversineKm(lat, lng, p.lat, p.lng) <= radius.km);
  }

  return res;
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}
