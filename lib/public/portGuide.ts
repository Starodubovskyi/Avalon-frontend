import type { Destination } from "@/lib/vessels/types";

/**
 * Public port guide: Sulina channel and the Danube ports Avalon covers.
 * Depths and limits are indicative planning figures, not navigational data —
 * the page always shows the "check current notices to mariners" note.
 * Texts live in the `publicPages` dictionary (`sulina.*`, `ports.<ID>.*`, `cargo.*`); this file holds the facts.
 */

export type CountryCode = "RO" | "UA" | "MD";

/** English names, for places outside the translated UI (metadata, logs) */
export const COUNTRY_LABEL: Record<CountryCode, string> = {
  RO: "Romania",
  UA: "Ukraine",
  MD: "Moldova",
};

export type CargoKey =
  | "alumina"
  | "generalCargo"
  | "project"
  | "grain"
  | "ironOre"
  | "steel"
  | "roro"
  | "vegOil"
  | "fertilisers"
  | "oilProducts"
  | "containers"
  | "steelProducts"
  | "timber"
  | "bulk";

export interface ChannelGuide {
  name: string;
  unlocode: string;
  timezone: string;
  /** `publicPages.sulina.facts.<key>.label|value` */
  facts: ("draught" | "length" | "pilotage" | "hours")[];
  /** `publicPages.sulina.rules.<key>` */
  rules: ("pilot" | "daylight" | "convoys" | "dues")[];
}

export interface PortGuide {
  id: Destination;
  name: string;
  country: CountryCode;
  /** null when we are not certain of the official code */
  unlocode: string | null;
  timezone: string;
  /** indicative maximum draught alongside, metres */
  draughtM: number;
  cargoes: CargoKey[];
  /** `publicPages.ports.<ID>.notes.<key>`; the position is `publicPages.ports.<ID>.position` */
  notes: ("n1" | "n2")[];
}

export const SULINA_CHANNEL: ChannelGuide = {
  name: "Sulina",
  unlocode: "ROSUL",
  timezone: "Europe/Bucharest",
  facts: ["draught", "length", "pilotage", "hours"],
  rules: ["pilot", "daylight", "convoys", "dues"],
};

const NOTES: PortGuide["notes"] = ["n1", "n2"];

export const PORT_GUIDE: PortGuide[] = [
  {
    id: "TULCEA",
    name: "Tulcea",
    country: "RO",
    unlocode: "ROTUL",
    timezone: "Europe/Bucharest",
    draughtM: 7.0,
    cargoes: ["alumina", "generalCargo", "project"],
    notes: NOTES,
  },
  {
    id: "IZMAIL",
    name: "Izmail",
    country: "UA",
    unlocode: "UAIZM",
    timezone: "Europe/Kyiv",
    draughtM: 7.0,
    cargoes: ["grain", "ironOre", "steel", "generalCargo"],
    notes: NOTES,
  },
  {
    id: "ORLIVKA",
    name: "Orlivka",
    country: "UA",
    unlocode: null,
    timezone: "Europe/Kyiv",
    draughtM: 6.0,
    cargoes: ["grain", "roro"],
    notes: NOTES,
  },
  {
    id: "RENI",
    name: "Reni",
    country: "UA",
    unlocode: "UAREN",
    timezone: "Europe/Kyiv",
    draughtM: 7.0,
    cargoes: ["grain", "vegOil", "fertilisers", "generalCargo"],
    notes: NOTES,
  },
  {
    id: "GIURGIULESTI",
    name: "Giurgiulești",
    country: "MD",
    unlocode: "MDGIU",
    timezone: "Europe/Chisinau",
    draughtM: 7.0,
    cargoes: ["oilProducts", "grain", "vegOil", "containers"],
    notes: NOTES,
  },
  {
    id: "GALATI",
    name: "Galați",
    country: "RO",
    unlocode: "ROGAL",
    timezone: "Europe/Bucharest",
    draughtM: 7.0,
    cargoes: ["steelProducts", "grain", "timber", "project"],
    notes: NOTES,
  },
  {
    id: "BRAILA",
    name: "Brăila",
    country: "RO",
    unlocode: "ROBRA",
    timezone: "Europe/Bucharest",
    draughtM: 7.0,
    cargoes: ["grain", "generalCargo", "bulk"],
    notes: NOTES,
  },
];

/** Port label lookup by destination id */
export function portGuideById(id: Destination): PortGuide | undefined {
  return PORT_GUIDE.find((p) => p.id === id);
}
