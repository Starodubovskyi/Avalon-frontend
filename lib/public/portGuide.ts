import type { Destination } from "@/lib/vessels/types";

/**
 * Public port guide: Sulina channel and the Danube ports Avalon covers.
 * Depths and limits are indicative planning figures, not navigational data —
 * the page always shows the "check current notices to mariners" note.
 */

export type CountryCode = "RO" | "UA" | "MD";

export const COUNTRY_LABEL: Record<CountryCode, string> = {
  RO: "Romania",
  UA: "Ukraine",
  MD: "Moldova",
};

export interface GuideFact {
  label: string;
  value: string;
}

export interface ChannelGuide {
  name: string;
  unlocode: string;
  timezone: string;
  summary: string;
  facts: GuideFact[];
  rules: string[];
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
  /** where the port sits on the river */
  position: string;
  cargoes: string[];
  notes: string[];
}

export const SULINA_CHANNEL: ChannelGuide = {
  name: "Sulina channel",
  unlocode: "ROSUL",
  timezone: "Europe/Bucharest",
  summary:
    "The canalised Sulina arm is the seagoing gateway to the Maritime Danube: every call at Tulcea, Galați, Brăila, Reni, Giurgiulești and most calls at Izmail and Orlivka start at the Sulina roads.",
  facts: [
    { label: "Max draught", value: "7.32 m (24 ft)" },
    { label: "Length", value: "≈ 64 km, Sulina → Tulcea fork" },
    { label: "Pilotage", value: "Compulsory, Romanian pilots" },
    { label: "Operating hours", value: "24 h, size-dependent limits" },
  ],
  rules: [
    "Pilot boards at the Sulina roads; the master's ETA and draught must be with the agent at least 24 h ahead.",
    "Deep-draught and long vessels may be restricted to daylight transits and one-way passages.",
    "Inbound traffic can be grouped into convoys by the harbour master when the roads are busy — allow waiting time.",
    "Channel dues are levied per passage by the Lower Danube River Administration (AFDJ Galați).",
  ],
};

export const PORT_GUIDE: PortGuide[] = [
  {
    id: "TULCEA",
    name: "Tulcea",
    country: "RO",
    unlocode: "ROTUL",
    timezone: "Europe/Bucharest",
    draughtM: 7.0,
    position: "Head of the Sulina arm, gateway to the Danube Delta",
    cargoes: ["Alumina & bauxite", "General cargo", "Project cargo"],
    notes: ["Shipyard calls and repairs", "Short river leg from Sulina — quick turnarounds"],
  },
  {
    id: "IZMAIL",
    name: "Izmail",
    country: "UA",
    unlocode: "UAIZM",
    timezone: "Europe/Kyiv",
    draughtM: 7.0,
    position: "Kiliya arm, the largest Ukrainian Danube port",
    cargoes: ["Grain", "Iron ore & coal", "Steel", "General cargo"],
    notes: ["Reached via Sulina or the Ukrainian Bystre route", "Ukrainian border and customs formalities on arrival"],
  },
  {
    id: "ORLIVKA",
    name: "Orlivka",
    country: "UA",
    unlocode: null,
    timezone: "Europe/Kyiv",
    draughtM: 6.0,
    position: "Main Danube, opposite Isaccea (RO)",
    cargoes: ["Grain", "Ro-Ro & ferry cargo"],
    notes: ["River terminals with limited berth length", "Confirm berth and draught with the terminal before nomination"],
  },
  {
    id: "RENI",
    name: "Reni",
    country: "UA",
    unlocode: "UAREN",
    timezone: "Europe/Kyiv",
    draughtM: 7.0,
    position: "Main Danube, near the Prut confluence",
    cargoes: ["Grain", "Vegetable oil", "Fertilisers", "General cargo"],
    notes: ["Busy grain season July–November", "Ukrainian border and customs formalities on arrival"],
  },
  {
    id: "GIURGIULESTI",
    name: "Giurgiulești",
    country: "MD",
    unlocode: "MDGIU",
    timezone: "Europe/Chisinau",
    draughtM: 7.0,
    position: "Moldova's only seagoing port, free port zone",
    cargoes: ["Oil products", "Grain", "Vegetable oil", "Containers"],
    notes: ["Free-zone status simplifies transit cargo", "Separate oil, grain and cargo terminals"],
  },
  {
    id: "GALATI",
    name: "Galați",
    country: "RO",
    unlocode: "ROGAL",
    timezone: "Europe/Bucharest",
    draughtM: 7.0,
    position: "Maritime Danube, Romania's largest river port",
    cargoes: ["Steel products", "Grain", "Timber", "Project cargo"],
    notes: ["Steelworks and shipyard berths", "Seat of the Lower Danube River Administration"],
  },
  {
    id: "BRAILA",
    name: "Brăila",
    country: "RO",
    unlocode: "ROBRA",
    timezone: "Europe/Bucharest",
    draughtM: 7.0,
    position: "Upper limit of the Maritime Danube",
    cargoes: ["Grain", "General cargo", "Bulk"],
    notes: ["Last port reachable by seagoing vessels", "Longer river passage — plan pilotage time"],
  },
];

export const INDICATIVE_NOTE = {
  title: "Indicative — check current notices to mariners.",
  detail: "Depths, limits and hours change with the river level and the harbour master's orders.",
} as const;

/** Port label lookup by destination id */
export function portGuideById(id: Destination): PortGuide | undefined {
  return PORT_GUIDE.find((p) => p.id === id);
}
