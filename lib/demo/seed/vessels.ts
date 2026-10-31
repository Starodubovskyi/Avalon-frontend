import type { Destination, OkStatus, T1Status, VesselCondition, VesselType } from "@/lib/vessels/types";
import { uuid } from "../ids";
import type { VesselRow } from "../types";

/**
 * The 16 board vessels (names, condition, T1/PDA/MSW from the client's sheet; dates relative to seeding,
 * contacts, IMOs and positions invented). Positions follow the Sulina channel and the Black Sea approach.
 */

const H = 3_600_000;
const D = 24 * H;

interface Spec {
  name: string;
  type: VesselType;
  destination: Destination;
  condition?: VesselCondition;
  t1?: T1Status;
  pdaSent?: boolean;
  mswIn?: boolean;
  mswOut?: boolean;
  prearrivalsIn?: OkStatus;
  prearrivalsOut?: OkStatus;
  pilotageArranged?: boolean;
  paid?: boolean;
  eta?: number;
  arrived?: number;
  inPort?: number;
  departed?: number;
  /** imo base (6 digits, check digit computed), mmsi */
  ids: [string, string];
  master: [string, string];
  office: [string, string];
  agent: string;
  pilot?: string;
  notes?: string;
  /** lat, lng, sog, cog, minutes since the fix */
  pos?: [number, number, number, number, number];
}

const SPECS: Spec[] = [
  // in port
  { name: "PRINCESS ABIR", type: "general_cargo", destination: "IZMAIL", condition: "loaded", t1: "yes", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, paid: true, eta: -6 * D, arrived: -5 * D, inPort: -3 * D, ids: ["931245", "271044812"], master: ["Capt. Kemal Aydın", "+90 532 000 41 18"], office: ["Abir Shipmanagement", "abir-ship"], agent: "Bessarabia Ship Agency — Izmail", pilot: "Sulina Pilots — V. Stan", notes: "Discharging 4,200 t milling wheat at berth 7. Surveyor on board daily 07:00.", pos: [45.3366, 28.8497, 0, 92, 6] },
  { name: "DEEB BREEZE", type: "general_cargo", destination: "RENI", condition: "loaded", t1: "yes", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, eta: -5 * D, arrived: -4 * D, inPort: -2 * D, ids: ["948870", "572318000"], master: ["Capt. Ahmed Fathy", "+20 100 000 2231"], office: ["Deeb Maritime SA", "deeb-maritime"], agent: "Reni Maritime Services", pilot: "Sulina Pilots — R. Enache", notes: "Steel coils. Owners asked for daily SOF updates.", pos: [45.4507, 28.2972, 0, 241, 11] },
  { name: "BMI EMPEROR", type: "general_cargo", destination: "IZMAIL", condition: "ballast", t1: "not_needed", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, paid: true, prearrivalsOut: "ok", eta: -8 * D, arrived: -7 * D, inPort: -5 * D, ids: ["922713", "636019874"], master: ["Capt. Ivan Petrov", "+359 88 000 4471"], office: ["BMI Denizcilik", "bmi-denizcilik"], agent: "Bessarabia Ship Agency — Izmail", pilot: "Sulina Pilots — V. Stan", notes: "Loading sunflower meal, ETC tomorrow evening.", pos: [45.3391, 28.8536, 0, 95, 4] },
  { name: "JANEX", type: "general_cargo", destination: "GIURGIULESTI", condition: "loaded", t1: "no", pdaSent: true, mswIn: true, prearrivalsIn: "ok", eta: -4 * D, arrived: -3 * D, inPort: -1 * D, ids: ["957734", "613204500"], master: ["Capt. Murat Demir", "+90 533 000 18 62"], office: ["Janex Navigation", "janex-nav"], agent: "Prut Port Agency — Giurgiulești", notes: "T1 refused by customs — new transit declaration in progress.", pos: [45.4731, 28.2061, 0, 310, 9] },
  // at Sulina roads / in the channel
  { name: "ATA1", type: "general_cargo", destination: "IZMAIL", condition: "loaded", t1: "yes", pdaSent: true, mswIn: true, prearrivalsIn: "ok", eta: -2 * D, arrived: -30 * H, ids: ["916602", "271051133"], master: ["Capt. Hasan Yıldız", "+90 535 000 77 03"], office: ["Ata Shipmanagement", "ata-ship"], agent: "Bessarabia Ship Agency — Izmail", pos: [45.1186, 29.8122, 0.2, 140, 8] },
  { name: "KEREMCAN", type: "general_cargo", destination: "RENI", condition: "loaded", t1: "yes", pdaSent: false, mswIn: true, eta: -1 * D, arrived: -12 * H, ids: ["938817", "271048977"], master: ["Capt. Ali Rıza Çelik", "+90 532 000 90 45"], office: ["Keremcan Denizcilik", "keremcan"], agent: "Reni Maritime Services", notes: "PDA waiting for owners' approval of the berth dues.", pos: [45.1303, 29.8366, 0.1, 310, 14] },
  { name: "TOYA", type: "tanker", destination: "GALATI", condition: "loaded", t1: "yes", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, eta: -36 * H, arrived: -20 * H, ids: ["944109", "538007342"], master: ["Capt. Nikos Andreou", "+30 694 000 1187"], office: ["Toya Tankers Inc", "toya-tankers"], agent: "Galați Port Agency", pilot: "Sulina Pilots — C. Marin", notes: "Transiting the Sulina channel, ETA Galați berth 03:00.", pos: [45.1694, 29.4618, 6.4, 282, 3] },
  { name: "VOLARIS-52", type: "general_cargo", destination: "ORLIVKA", condition: "ballast", t1: "not_needed", pdaSent: false, mswIn: true, eta: -20 * H, arrived: -6 * H, ids: ["921556", "667001842"], master: ["Capt. Serhii Melnyk", "+380 67 000 3390"], office: ["Volaris Marine", "volaris-marine"], agent: "Orlivka Berth Operator", pos: [45.1069, 29.7893, 0, 205, 17] },
  // expected
  { name: "UGAH CONFIDENCE", type: "general_cargo", destination: "IZMAIL", condition: "ballast", t1: "not_needed", pdaSent: false, mswIn: true, eta: 14 * H, ids: ["970213", "351672000"], master: ["Capt. Levan Beridze", "+995 599 000 412"], office: ["Ugah Shipping Co", "ugah-shipping"], agent: "Bessarabia Ship Agency — Izmail", pos: [43.1042, 29.9031, 10.9, 18, 3] },
  { name: "KARANFIL", type: "livestock", destination: "BRAILA", condition: "ballast", t1: "not_needed", pdaSent: true, mswIn: true, prearrivalsIn: "ok", eta: 30 * H, ids: ["903418", "271063355"], master: ["Capt. Omer Kaya", "+90 530 000 25 81"], office: ["Karanfil Livestock Carriers", "karanfil-lc"], agent: "Brăila Danube Agency", notes: "Livestock loading at Brăila — vet inspection booked on arrival.", pos: [41.6213, 29.2104, 11.6, 12, 2] },
  { name: "AZOV COAST", type: "general_cargo", destination: "TULCEA", condition: "ballast", t1: "not_needed", pdaSent: true, mswIn: true, eta: 2 * D + 6 * H, ids: ["958841", "341209000"], master: ["Capt. Pavel Rusu", "+373 69 000 512"], office: ["Azov Coast Shipping", "azov-coast"], agent: "Tulcea Ship Services" },
  { name: "SEA GLORY", type: "tanker", destination: "RENI", condition: "ballast", eta: 4 * D, ids: ["965027", "248517000"], master: ["Capt. Georgios Marinos", "+30 697 000 2240"], office: ["Sea Glory Tankers", "seaglory"], agent: "Reni Maritime Services", notes: "Nomination only — cargo and quantity to be confirmed by charterers." },
  // departed
  { name: "YALISSA", type: "general_cargo", destination: "IZMAIL", condition: "loaded", t1: "yes", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, paid: true, prearrivalsOut: "ok", mswOut: false, eta: -14 * D, arrived: -13 * D, inPort: -11 * D, departed: -2 * D, ids: ["912377", "620999123"], master: ["Capt. Vasile Ciobanu", "+40 721 000 318"], office: ["Yalissa Maritime", "yalissa"], agent: "Bessarabia Ship Agency — Izmail", pilot: "Sulina Pilots — V. Stan", pos: [41.3204, 29.1532, 11.2, 200, 1500] },
  { name: "TALIA", type: "general_cargo", destination: "IZMAIL", condition: "loaded", t1: "yes", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, paid: false, prearrivalsOut: "ok", mswOut: false, eta: -12 * D, arrived: -11 * D, inPort: -9 * D, departed: -3 * D, ids: ["947163", "457900120"], master: ["Capt. Dmytro Savchuk", "+380 50 000 7714"], office: ["Talia Shipping", "talia-shipping"], agent: "Bessarabia Ship Agency — Izmail", pilot: "Sulina Pilots — R. Enache", notes: "Owners promised the balance by Friday — chase if not received." },
  { name: "SEA PIONEER", type: "general_cargo", destination: "RENI", t1: "not_needed", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, paid: true, prearrivalsOut: "ok", mswOut: true, eta: -20 * D, arrived: -19 * D, inPort: -17 * D, departed: -9 * D, ids: ["933590", "671205100"], master: ["Capt. Taras Bondarenko", "+380 63 000 1205"], office: ["Pioneer Bulk", "pioneer-bulk"], agent: "Reni Maritime Services", pilot: "Sulina Pilots — C. Marin" },
  { name: "CHELSEA 3", type: "general_cargo", destination: "GIURGIULESTI", t1: "not_needed", pdaSent: true, mswIn: true, prearrivalsIn: "ok", pilotageArranged: true, paid: true, prearrivalsOut: "ok", mswOut: true, eta: -25 * D, arrived: -24 * D, inPort: -22 * D, departed: -15 * D, ids: ["925548", "312456000"], master: ["Capt. Ion Grosu", "+373 68 000 904"], office: ["Chelsea Marine", "chelsea-marine"], agent: "Prut Port Agency — Giurgiulești", pilot: "Sulina Pilots — R. Enache" },
];

/** IMO check digit: weighted sum of the first six digits (7..2) mod 10 */
function imoNumber(base: string): string {
  const sum = base.split("").reduce((acc, d, i) => acc + Number(d) * (7 - i), 0);
  return `${base}${sum % 10}`;
}

function at(now: number, offset: number | undefined): string | null {
  return offset === undefined ? null : new Date(now + offset).toISOString();
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function seedVessels(now: number): VesselRow[] {
  return SPECS.map((s) => {
    const firstMilestone = s.eta ?? 0;
    const createdAt = new Date(Math.min(now + firstMilestone - 4 * D, now - 26 * H)).toISOString();
    const pos = s.pos ?? null;
    return {
      id: uuid(),
      name: s.name,
      imo: imoNumber(s.ids[0]),
      mmsi: s.ids[1],
      type: s.type,
      destination: s.destination,
      condition: s.condition ?? null,
      etaSulina: at(now, s.eta),
      arrivedAt: at(now, s.arrived),
      inPortAt: at(now, s.inPort),
      departedAt: at(now, s.departed),
      lat: pos ? pos[0] : null,
      lng: pos ? pos[1] : null,
      sog: pos ? pos[2] : null,
      cog: pos ? pos[3] : null,
      positionSource: pos ? "ais" : null,
      positionAt: pos ? new Date(now - pos[4] * 60_000).toISOString() : null,
      masterName: s.master[0],
      masterPhone: s.master[1],
      masterEmail: `master.${slug(s.name)}@fleetmail.example`,
      officeName: s.office[0],
      officePhone: `+357 25 0${s.ids[0].slice(1, 3)} ${s.ids[0].slice(3, 6)}`,
      officeEmail: `ops@${s.office[1]}.example`,
      portAgent: s.agent,
      prearrivalsIn: s.prearrivalsIn ?? "not_ok",
      prearrivalsOut: s.prearrivalsOut ?? "not_ok",
      mswIn: s.mswIn ?? false,
      mswOut: s.mswOut ?? false,
      pdaSent: s.pdaSent ?? false,
      paid: s.paid ?? false,
      t1: s.t1 ?? null,
      pilotageArranged: s.pilotageArranged ?? false,
      pilot: s.pilot ?? null,
      notes: s.notes ?? null,
      createdById: 702,
      updatedById: 702,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      anchor: pos ? [pos[0], pos[1]] : null,
    };
  });
}
