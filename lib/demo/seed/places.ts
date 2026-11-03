import type { PointKind } from "@/lib/points/team-points";
import type { ActivityCode } from "@/lib/points/activities";
import { uuid } from "../ids";
import type { MapPointRow, PortRow, PortStatusValue } from "../types";
import { DEMO_LOGOS, type DemoLogo } from "./places-logos";

/** Team map points along the Lower Danube and the Black Sea, and the port list; all contacts are invented */

interface PointSpec {
  kind: PointKind;
  at: [lat: number, lng: number];
  title: string;
  activity: ActivityCode | null;
  phone: string;
  email: string;
  address: string;
  logo?: DemoLogo;
  by: number;
  /** demo users who starred the point */
  fav?: number[];
}

const POINTS: PointSpec[] = [
  { kind: "head_office", at: [45.1588, 29.6553], title: "Avalon Shipping SRL", activity: "ship_agency", phone: "+40 240 000 700", email: "ops@avalon-demo.example", address: "Str. I nr. 1, Sulina", logo: "avalon", by: 701, fav: [701, 702, 703] },
  { kind: "authority", at: [45.1571, 29.6634], title: "Sulina Harbour Master", activity: null, phone: "+40 240 000 101", email: "duty@sulina-hm.example", address: "Str. I, Sulina", by: 701, fav: [701] },
  { kind: "authority", at: [45.1553, 29.6719], title: "Border Police — Sulina", activity: null, phone: "+40 240 000 102", email: "sulina@border-demo.example", address: "Faleza Sulina", by: 702 },
  { kind: "self_employed", at: [45.1603, 29.6802], title: "Viorel Stan — Sulina pilot", activity: "ship_operation", phone: "+40 744 000 215", email: "v.stan@sulina-pilots.example", address: "Sulina pilot station", by: 702, fav: [702] },
  { kind: "private_person", at: [45.1581, 29.6589], title: "Andrei Lungu", activity: "ship_agency", phone: "+40 721 000 702", email: "andrei.lungu@avalon-demo.example", address: "Avalon office, Sulina", by: 701 },
  { kind: "for_sale", at: [45.1626, 29.6921], title: "Tug “Sulina Star” — 1,200 hp", activity: "shipowners", phone: "+40 745 000 318", email: "sale@sulina-star.example", address: "Sulina, river berth 3", by: 703 },
  { kind: "head_office", at: [45.1781, 28.8122], title: "Delta Marine Supply", activity: "ship_supply", phone: "+40 240 000 233", email: "orders@delta-supply.example", address: "Str. Isaccei 5, Tulcea", logo: "delta", by: 704 },
  { kind: "branch", at: [45.1752, 28.8034], title: "Avalon Shipping — Tulcea", activity: "ship_agency", phone: "+40 240 000 705", email: "tulcea@avalon-demo.example", address: "Str. Babadag 2, Tulcea", logo: "avalon", by: 701 },
  { kind: "head_office", at: [45.3449, 28.8381], title: "Bessarabia Ship Agency", activity: "ship_agency", phone: "+380 4841 0 0127", email: "ops@bessarabia-agency.example", address: "Portova St 4, Izmail", logo: "bessarabia", by: 702, fav: [702] },
  { kind: "branch", at: [45.3366, 28.8478], title: "Izmail Sea Port — Berth 7", activity: "cargo_shippers", phone: "+380 4841 0 0712", email: "berth7@izmail-port.example", address: "Izmail port, berth 7", by: 703 },
  { kind: "authority", at: [45.3419, 28.8442], title: "Izmail Customs Post", activity: null, phone: "+380 4841 0 0303", email: "post@izmail-customs.example", address: "Izmail port gate 2", by: 703 },
  { kind: "private_person", at: [45.3471, 28.8355], title: "Olena Kravets", activity: null, phone: "+380 67 000 7030", email: "olena.kravets@avalon-demo.example", address: "Izmail", by: 701 },
  { kind: "branch", at: [45.3405, 28.8292], title: "Avalon Shipping — Izmail", activity: "ship_agency", phone: "+380 4841 0 0700", email: "izmail@avalon-demo.example", address: "Bolhradska St 9, Izmail", logo: "avalon", by: 701 },
  { kind: "head_office", at: [45.4521, 28.2942], title: "Reni Maritime Services", activity: "crewing", phone: "+380 4840 0 0391", email: "agency@reni-maritime.example", address: "Dunaiska St 18, Reni", logo: "reni", by: 702 },
  { kind: "branch", at: [45.4498, 28.3011], title: "Reni Port — Grain Berth 12", activity: "cargo_shippers", phone: "+380 4840 0 0212", email: "grain12@reni-port.example", address: "Reni port, berth 12", by: 702 },
  { kind: "self_employed", at: [45.4469, 28.2876], title: "Natalia Bondar — draft surveyor", activity: null, phone: "+380 67 000 4419", email: "n.bondar@surveys.example", address: "Reni", by: 703 },
  { kind: "for_sale", at: [45.4432, 28.2783], title: "Warehouse plot, Reni port zone", activity: null, phone: "+380 67 000 5520", email: "plot@reni-estate.example", address: "Reni port zone, lot 14", by: 704 },
  { kind: "branch", at: [45.4744, 28.1997], title: "Giurgiulești — Liquid Terminal", activity: "bunker_supply", phone: "+373 299 0 0480", email: "terminal@giurgiulesti-port.example", address: "Giurgiulești free port", by: 704 },
  { kind: "head_office", at: [45.4262, 28.0581], title: "Danube Grain Trading SRL", activity: "commodity_trading", phone: "+40 236 000 410", email: "chartering@danube-grain.example", address: "Str. Portului 12, Galați", logo: "grain", by: 701, fav: [701] },
  { kind: "private_person", at: [45.4351, 28.0446], title: "Mihai Dobre", activity: null, phone: "+40 722 000 704", email: "mihai.dobre@avalon-demo.example", address: "Galați", by: 701 },
  { kind: "self_employed", at: [45.4309, 28.0522], title: "Radu Ionescu — ship broker", activity: "ship_brokers", phone: "+40 723 000 118", email: "radu@ionescu-broking.example", address: "Str. Domnească 40, Galați", by: 704 },
  { kind: "head_office", at: [45.2714, 27.9792], title: "Brăila Danube Agency", activity: "ship_agency", phone: "+40 239 000 518", email: "office@braila-agency.example", address: "Calea Călărașilor 3, Brăila", by: 703 },
  { kind: "head_office", at: [44.1733, 28.6383], title: "Pontic Bunkers SA", activity: "bunker_supply", phone: "+40 241 000 650", email: "stem@pontic-bunkers.example", address: "Port of Constanța, gate 1", logo: "pontic", by: 704 },
  { kind: "branch", at: [44.1102, 28.6487], title: "Constanța South — Berth 80", activity: "cargo_charterers", phone: "+40 241 000 680", email: "berth80@constanta-south.example", address: "Constanța South, pier 4", by: 703 },
  { kind: "head_office", at: [46.4846, 30.7326], title: "Black Sea Crewing", activity: "crewing", phone: "+380 48 000 2210", email: "crew@blacksea-crewing.example", address: "Lanzheronivska St 6, Odesa", by: 702 },
  { kind: "head_office", at: [43.2047, 27.9105], title: "Varna Ship Repair Yard", activity: "ship_repair", phone: "+359 52 000 410", email: "yard@varna-repair.example", address: "Varna West industrial zone", by: 704 },
  { kind: "head_office", at: [41.0216, 28.9741], title: "Bosphorus Chartering", activity: "ship_charterers", phone: "+90 212 000 4410", email: "desk@bosphorus-chartering.example", address: "Karaköy, Istanbul", by: 703 },
];

export function seedPoints(now: number): MapPointRow[] {
  return POINTS.map((p, i) => {
    const at = new Date(now - (POINTS.length - i) * 29 * 3_600_000).toISOString();
    return {
      id: uuid(),
      userId: p.by,
      kind: p.kind,
      lat: p.at[0],
      lng: p.at[1],
      firstName: p.title,
      lastName: "",
      activity: "",
      activities: p.activity ? [p.activity] : [],
      logo: p.logo ? DEMO_LOGOS[p.logo] : null,
      logoVersion: p.logo ? `seed-${p.logo}` : null,
      phone: p.phone,
      email: p.email,
      address: p.address,
      notes: null,
      favoritedBy: p.fav ?? [],
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
