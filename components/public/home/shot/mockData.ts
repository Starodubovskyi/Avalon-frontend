import type { VesselCondition, VesselStage, VesselType } from "@/lib/vessels/types";

/** Illustrative rows for the product mock-ups — the same fleet the demo opens with */
export interface MockVessel {
  name: string;
  type: Extract<VesselType, "general_cargo" | "tanker">;
  condition: VesselCondition;
  stage: VesselStage;
  /** days since sailing without payment */
  unpaidDays?: number;
  dest: string;
  /** ETA Sulina, local wall time on the Danube */
  eta: string;
  /** PRE IN, MSW IN, PDA */
  checks: [boolean, boolean, boolean];
}

export const MOCK_VESSELS: MockVessel[] = [
  { name: "TALIA", type: "general_cargo", condition: "loaded", stage: "departed", unpaidDays: 3, dest: "Izmail", eta: "2026-10-22T10:06:00Z", checks: [true, true, true] },
  { name: "SEA GLORY", type: "general_cargo", condition: "ballast", stage: "expected", dest: "Reni", eta: "2026-11-04T02:30:00Z", checks: [false, false, false] },
  { name: "KEREMCAN", type: "tanker", condition: "loaded", stage: "at_roads", dest: "Reni", eta: "2026-11-03T07:10:00Z", checks: [true, false, true] },
  { name: "BMI EMPEROR", type: "general_cargo", condition: "ballast", stage: "in_port", dest: "Izmail", eta: "2026-10-29T09:06:00Z", checks: [true, true, true] },
  { name: "JANEX", type: "tanker", condition: "loaded", stage: "in_port", dest: "Giurgiulești", eta: "2026-10-30T09:06:00Z", checks: [true, true, false] },
];

export const CHECK_LABELS = ["PRE IN", "MSW IN", "PDA"] as const;

/** Labels live in `home.shot.tabs.<key>` */
export const BOARD_TABS = [
  { key: "work", count: 13, active: true },
  { key: "expected", count: 4 },
  { key: "roads", count: 4 },
  { key: "port", count: 4 },
  { key: "unpaid", count: 1, alert: true },
] as const;
