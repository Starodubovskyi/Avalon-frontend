/** Business Activity of a map point (backend ACTIVITY_CODES); one is free, more need Premium (stage 2) */
export const ACTIVITY_CODES = [
  "ship_agency",
  "ship_supply",
  "ship_operation",
  "ship_management",
  "crewing",
  "ship_repair",
  "shipowners",
  "bunker_supply",
  "ship_charterers",
  "ship_brokers",
  "cargo_brokers",
  "cargo_charterers",
  "cargo_shippers",
  "commodity_trading",
] as const;

export type ActivityCode = (typeof ACTIVITY_CODES)[number];

export const ACTIVITY_LABEL: Record<ActivityCode, string> = {
  ship_agency: "Ship agency",
  ship_supply: "Ship supply, ship chandler",
  ship_operation: "Ship operation",
  ship_management: "Ship management",
  crewing: "Crew management / crewing",
  ship_repair: "Ship repair",
  shipowners: "Shipowners",
  bunker_supply: "Bunker and oil supply",
  ship_charterers: "Ship charterers",
  ship_brokers: "Ship brokers",
  cargo_brokers: "Cargo brokers",
  cargo_charterers: "Cargo charterers",
  cargo_shippers: "Cargo shippers",
  commodity_trading: "Commodity trading",
};

/** How many activities a point may have without a balance (backend answers 422 premiumRequired above it) */
export const FREE_ACTIVITIES = 1;

export function isActivityCode(value: unknown): value is ActivityCode {
  return typeof value === "string" && (ACTIVITY_CODES as readonly string[]).includes(value);
}

/** Known codes only, unique, in the order given */
export function toActivityCodes(value: unknown): ActivityCode[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isActivityCode).filter((code, i, all) => all.indexOf(code) === i);
}

/** Legacy free-text activity that equals a label ("Ship Agency" → ship_agency), as the migration does */
export function activityFromText(text: string | null | undefined): ActivityCode | null {
  const t = (text ?? "").trim().toLowerCase();
  if (!t) return null;
  return ACTIVITY_CODES.find((c) => ACTIVITY_LABEL[c].toLowerCase() === t) ?? null;
}

/** Text for the card's Business Activity line: first code, else the legacy free text */
export function activityLine(p: { activities: readonly ActivityCode[]; activity?: string | null }): string {
  const code = p.activities[0];
  if (code) return ACTIVITY_LABEL[code];
  return (p.activity ?? "").trim();
}
