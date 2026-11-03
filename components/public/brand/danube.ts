/**
 * Schematic Lower Danube in a 1000 × 420 box (equirectangular, ≈ 27.8–29.9° E, 45.0–45.6° N).
 * Decorative geography for the public site and sign-in — not a navigational chart.
 */
export const DANUBE_VIEWBOX = "0 0 1000 420";

/** Black Sea east of the delta */
export const SEA_PATH =
  "M 940 0 C 915 70 938 120 922 150 C 905 190 930 240 916 290 C 904 335 926 380 912 420 L 1000 420 L 1000 0 Z";
export const COAST_PATH = "M 940 0 C 915 70 938 120 922 150 C 905 190 930 240 916 290 C 904 335 926 380 912 420";

/** Seagoing route drawn from the Sulina roads upstream past Brăila — the direction a vessel travels */
export const MAIN_ROUTE =
  "M 985 300 L 900 295 C 770 300 600 292 476 282 C 462 276 452 266 443 255 C 400 236 352 220 319 201 C 282 178 252 124 224 101 C 212 92 202 88 190 87 C 160 88 134 98 119 114 C 98 140 84 178 81 221 C 78 262 72 330 62 420";

/** Chilia arm past Izmail, St George arm, and the Prut and Siret tributaries */
export const SIDE_ARMS = [
  "M 443 255 C 462 222 478 186 495 168 C 560 138 700 152 780 142 C 845 134 890 140 925 146",
  "M 486 286 C 590 322 740 372 850 420",
];
export const TRIBUTARIES = ["M 190 87 C 196 58 182 28 198 0", "M 119 114 C 90 104 52 86 0 76"];

export interface DanubePort {
  /** matches the anchors on /port-guide */
  id: string;
  name: string;
  x: number;
  y: number;
  /** label offset from the dot */
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
  sea?: boolean;
}

export const DANUBE_PORTS: DanubePort[] = [
  { id: "sulina", name: "Sulina", x: 900, y: 295, dx: -4, dy: -24, anchor: "middle", sea: true },
  { id: "tulcea", name: "Tulcea", x: 476, y: 282, dx: 0, dy: 38, anchor: "middle" },
  { id: "izmail", name: "Izmail", x: 495, y: 168, dx: 4, dy: -22, anchor: "middle" },
  { id: "orlivka", name: "Orlivka", x: 319, y: 201, dx: 6, dy: 38, anchor: "middle" },
  { id: "reni", name: "Reni", x: 224, y: 101, dx: 26, dy: 5, anchor: "start" },
  { id: "giurgiulesti", name: "Giurgiulești", x: 190, y: 87, dx: 8, dy: -20, anchor: "middle" },
  { id: "galati", name: "Galați", x: 119, y: 114, dx: -18, dy: 7, anchor: "end" },
  { id: "braila", name: "Brăila", x: 81, y: 221, dx: 20, dy: 7, anchor: "start" },
];

export const COUNTRY_LABELS = [
  { name: "ROMANIA", x: 270, y: 368 },
  { name: "UKRAINE", x: 650, y: 72 },
  { name: "MOLDOVA", x: 300, y: 34 },
];

/** Static class names for staggered pulses (Tailwind needs literal strings) */
export const PULSE_DELAYS = [
  "[animation-delay:0ms]",
  "[animation-delay:350ms]",
  "[animation-delay:700ms]",
  "[animation-delay:1050ms]",
  "[animation-delay:1400ms]",
  "[animation-delay:1750ms]",
  "[animation-delay:2100ms]",
  "[animation-delay:2450ms]",
];
