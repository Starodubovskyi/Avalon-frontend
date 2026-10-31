import type { DocumentCategory } from "@/lib/vessels/types";
import { uuid } from "../ids";
import type { DocumentRow, VesselRow } from "../types";

/** Document metadata only; downloads are generated on the fly (see handlers/documentFiles.ts) */

type DocSpec = [
  title: string,
  category: DocumentCategory,
  vessel: string | null,
  originalName: string,
  size: number,
  hoursAgo: number,
  uploadedBy: number,
  notes: string | null,
];

const DOCS: DocSpec[] = [
  ["Notice of readiness", "vessel", "PRINCESS ABIR", "PRINCESS_ABIR_NOR.pdf", 148_224, 70, 703, "Tendered on arrival at Izmail."],
  ["Cargo manifest — 4,200 t wheat", "customs", "PRINCESS ABIR", "PRINCESS_ABIR_manifest.pdf", 412_610, 96, 703, null],
  ["PDA — Izmail", "finance", "PRINCESS ABIR", "PDA_Izmail_PRINCESS_ABIR.pdf", 96_512, 140, 702, "Approved by owners."],
  ["Ship particulars", "vessel", "TOYA", "TOYA_ship_particulars.pdf", 233_472, 40, 702, null],
  ["Crew list", "crew", "TOYA", "TOYA_crew_list.pdf", 88_064, 22, 704, "For the crew change at Galați."],
  ["Port clearance request", "port", "BMI EMPEROR", "BMI_EMPEROR_clearance.pdf", 64_000, 30, 703, null],
  ["Statement of facts", "port", "YALISSA", "YALISSA_SOF.pdf", 121_856, 50, 703, null],
  ["Final disbursement account", "finance", "YALISSA", "YALISSA_FDA.pdf", 104_448, 46, 701, "Paid in full."],
  ["Agency fee invoice", "finance", "TALIA", "TALIA_invoice_agency_fee.pdf", 58_368, 70, 701, "Outstanding — owners promised payment by Friday."],
  ["T1 transit declaration (draft)", "customs", "JANEX", "JANEX_T1_draft.pdf", 77_824, 12, 703, "Resubmitted after the first refusal."],
  ["Prearrival checklist", "template", null, "Prearrival_checklist_template.pdf", 41_984, 600, 701, "Send to the master 48 h before ETA."],
  ["Crew list template", "template", null, "Crew_list_template.csv", 2_312, 620, 703, null],
  ["Sulina channel draft notice — week 44", "port", null, "Sulina_draft_notice_w44.pdf", 52_224, 26, 702, "Max draft 7.0 m from Monday."],
  ["Lower Danube pilotage tariffs 2026", "other", null, "Pilotage_tariffs_2026.csv", 6_144, 900, 701, null],
];

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  csv: "text/csv",
};

export function seedDocuments(vessels: VesselRow[], now: number): DocumentRow[] {
  const idByName = new Map(vessels.map((v) => [v.name, v.id]));
  return DOCS.map(([title, category, vessel, originalName, size, hoursAgo, uploadedBy, notes]) => ({
    id: uuid(),
    title,
    category,
    vesselId: vessel ? idByName.get(vessel) ?? null : null,
    originalName,
    mimeType: MIME[originalName.split(".").pop() ?? ""] ?? "application/octet-stream",
    size,
    notes,
    uploadedById: uploadedBy,
    createdAt: new Date(now - hoursAgo * 3_600_000).toISOString(),
    deletedAt: null,
  }));
}
