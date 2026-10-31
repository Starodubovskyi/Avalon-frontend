import type { PointKind } from "@/lib/points/team-points";
import { uuid } from "../ids";
import type { MapPointRow, PortRow, PortStatusValue } from "../types";

/** Team map contacts along the Lower Danube and the port list; contacts are invented */

type PointSpec = [
  kind: PointKind,
  lat: number,
  lng: number,
  firstName: string,
  lastName: string,
  activity: string,
  phone: string,
  email: string,
  address: string,
  notes: string | null,
  createdBy: number,
];

const POINTS: PointSpec[] = [
  ["company", 45.4262, 28.0581, "Danube Grain Trading SRL", "", "Charterer — grain and oilseeds", "+40 236 000 410", "chartering@danube-grain.example", "Str. Portului 12, Galați", "Main charterer for Izmail and Reni wheat cargoes.", 701],
  ["company", 45.1781, 28.8122, "Delta Marine Supply", "", "Ship chandler and bunkers by barge", "+40 240 000 233", "orders@delta-supply.example", "Str. Isaccei 5, Tulcea", "Delivers to Sulina roads within 6 h.", 704],
  ["agency", 45.3449, 28.8381, "Bessarabia Ship Agency", "", "Port agent — Izmail", "+380 4841 0 0127", "ops@bessarabia-agency.example", "Portova St 4, Izmail", "Our sub-agent for Izmail berths 1–12.", 702],
  ["agency", 45.4521, 28.2942, "Reni Maritime Services", "", "Port agent — Reni", "+380 4840 0 0391", "agency@reni-maritime.example", "Dunaiska St 18, Reni", null, 702],
  ["agency", 45.2714, 27.9792, "Brăila Danube Agency", "", "Port agent — Brăila", "+40 239 000 518", "office@braila-agency.example", "Calea Călărașilor 3, Brăila", "Handles livestock carriers — vet paperwork.", 703],
  ["terminal", 45.3366, 28.8478, "Izmail Sea Port — Berth 7", "", "General cargo berth, 2 × 32 t cranes", "+380 4841 0 0712", "berth7@izmail-port.example", "Izmail port, berth 7", "Max draft 7.2 m.", 703],
  ["terminal", 45.4498, 28.3011, "Reni Port — Grain Berth 12", "", "Grain terminal, 600 t/h loading", "+380 4840 0 0212", "grain12@reni-port.example", "Reni port, berth 12", null, 702],
  ["terminal", 45.4744, 28.1997, "Giurgiulești Port — Liquid Terminal", "", "Oil products and vegetable oil berth", "+373 299 0 0480", "terminal@giurgiulesti-port.example", "Giurgiulești free port", "Night berthing allowed with two tugs.", 704],
  ["terminal", 45.2963, 28.4608, "Orlivka Cargo Berth", "", "Ferry and general cargo berth", "+380 4840 0 0544", "berth@orlivka.example", "Orlivka river berth", null, 702],
  ["authority", 45.1571, 29.6634, "Sulina Harbour Master", "", "Port authority — clearance and channel", "+40 240 000 101", "duty@sulina-hm.example", "Str. I, Sulina", "VHF 16 / 12. Channel draft notices every Monday.", 701],
  ["authority", 45.1553, 29.6719, "Border Police — Sulina", "", "Immigration and crew lists", "+40 240 000 102", "sulina@border-demo.example", "Faleza Sulina", null, 702],
  ["authority", 45.3419, 28.8442, "Izmail Customs Post", "", "Customs — T1 and transit", "+380 4841 0 0303", "post@izmail-customs.example", "Izmail port gate 2", "T1 desk open 08:00–20:00.", 703],
  ["person", 45.1603, 29.6802, "Viorel", "Stan", "Sulina pilot — boarding at roads", "+40 744 000 215", "v.stan@sulina-pilots.example", "Sulina pilot station", "Prefers WhatsApp for ETAs.", 702],
  ["person", 45.4469, 28.2876, "Natalia", "Bondar", "Cargo surveyor (draft surveys)", "+380 67 000 4419", "n.bondar@surveys.example", "Reni", null, 703],
  ["employee", 45.1581, 29.6589, "Andrei", "Lungu", "Avalon operations — Sulina", "+40 721 000 702", "andrei.lungu@avalon-demo.example", "Avalon office, Sulina", "On duty Mon–Fri, standby weekends.", 701],
  ["employee", 45.3471, 28.8355, "Olena", "Kravets", "Avalon documentation — Izmail", "+380 67 000 7030", "olena.kravets@avalon-demo.example", "Izmail", null, 701],
  ["employee", 45.4351, 28.0446, "Mihai", "Dobre", "Avalon husbandry — Galați", "+40 722 000 704", "mihai.dobre@avalon-demo.example", "Galați", null, 701],
];

export function seedPoints(now: number): MapPointRow[] {
  return POINTS.map((p, i) => {
    const at = new Date(now - (POINTS.length - i) * 31 * 3_600_000).toISOString();
    return {
      id: uuid(),
      userId: p[10],
      kind: p[0],
      lat: p[1],
      lng: p[2],
      firstName: p[3],
      lastName: p[4],
      activity: p[5],
      phone: p[6],
      email: p[7],
      address: p[8],
      notes: p[9],
      createdAt: at,
      updatedAt: at,
      deletedAt: null,
    };
  });
}

type PortSpec = [name: string, unlocode: string, country: string, status: PortStatusValue, timezone: string, lat: number, lng: number];

const PORTS: PortSpec[] = [
  ["Izmail", "UAIZM", "UA", "OPEN", "Europe/Kyiv", 45.342, 28.838],
  ["Reni", "UAREN", "UA", "CONGESTED", "Europe/Kyiv", 45.445, 28.285],
  ["Orlivka", "UAORL", "UA", "OPEN", "Europe/Kyiv", 45.297, 28.459],
  ["Giurgiulești", "MDGIU", "MD", "OPEN", "Europe/Chisinau", 45.47, 28.205],
  ["Galați", "ROGAL", "RO", "OPEN", "Europe/Bucharest", 45.435, 28.048],
  ["Brăila", "ROBRA", "RO", "OPEN", "Europe/Bucharest", 45.269, 27.975],
  ["Tulcea", "ROTCE", "RO", "OPEN", "Europe/Bucharest", 45.179, 28.805],
  ["Sulina", "ROSUL", "RO", "OPEN", "Europe/Bucharest", 45.156, 29.659],
  ["Constanța", "ROCND", "RO", "OPEN", "Europe/Bucharest", 44.16, 28.635],
  ["Midia", "ROMID", "RO", "CLOSED", "Europe/Bucharest", 44.341, 28.678],
  ["Varna", "BGVAR", "BG", "OPEN", "Europe/Sofia", 43.193, 27.927],
  ["Istanbul", "TRIST", "TR", "CONGESTED", "Europe/Istanbul", 41.006, 28.976],
];

export function seedPorts(now: number): PortRow[] {
  const at = new Date(now - 90 * 86_400_000).toISOString();
  return PORTS.map(([name, unlocode, country, status, timezone, lat, lng]) => ({
    id: uuid(),
    name,
    unlocode,
    country,
    status,
    timezone,
    lat,
    lng,
    createdAt: at,
    updatedAt: at,
    deletedAt: null,
  }));
}
