import type { VesselStage } from "@/lib/vessels/types";

/** Illustrative rows for the product mock-ups — the same fleet the demo opens with */
export interface MockVessel {
  name: string;
  kind: "cargo" | "tanker";
  sub: string;
  stage: VesselStage;
  /** days since sailing without payment */
  unpaidDays?: number;
  dest: string;
  eta: string;
  /** PRE IN, MSW IN, PDA */
  checks: [boolean, boolean, boolean];
}

export const MOCK_VESSELS: MockVessel[] = [
  { name: "TALIA", kind: "cargo", sub: "General cargo · Loaded", stage: "departed", unpaidDays: 3, dest: "Izmail", eta: "22 Oct 12:06", checks: [true, true, true] },
  { name: "SEA GLORY", kind: "cargo", sub: "General cargo · Ballast", stage: "expected", dest: "Reni", eta: "04 Nov 04:30", checks: [false, false, false] },
  { name: "KEREMCAN", kind: "tanker", sub: "Tanker · Loaded", stage: "at_roads", dest: "Reni", eta: "03 Nov 09:10", checks: [true, false, true] },
  { name: "BMI EMPEROR", kind: "cargo", sub: "General cargo · Ballast", stage: "in_port", dest: "Izmail", eta: "29 Oct 11:06", checks: [true, true, true] },
  { name: "JANEX", kind: "tanker", sub: "Tanker · Loaded", stage: "in_port", dest: "Giurgiulești", eta: "30 Oct 11:06", checks: [true, true, false] },
];

export const CHECK_LABELS = ["PRE IN", "MSW IN", "PDA"] as const;

export const BOARD_TABS = [
  { label: "In work", count: 13, active: true },
  { label: "Expected", count: 4 },
  { label: "At roads", count: 4 },
  { label: "In port", count: 4 },
  { label: "Sailed unpaid", count: 1, alert: true },
];
