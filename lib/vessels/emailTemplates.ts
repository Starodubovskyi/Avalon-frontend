import { fmtFull } from "./format";
import { isUnpaidAfterDeparture } from "./status";
import { CONDITION_LABEL, DESTINATION_LABEL, TYPE_LABEL, type VesselView } from "./types";

export type TemplateKey = "prearrival" | "pda" | "arrival" | "berthing" | "sailing" | "payment";
export type Recipient = "master" | "office";

export interface EmailTemplate {
  key: TemplateKey;
  label: string;
  hint: string;
  to: Recipient;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  { key: "prearrival", label: "Pre-arrival request", hint: "Ask the master for arrival documents", to: "master" },
  { key: "pda", label: "PDA to owners", hint: "Proforma disbursement account", to: "office" },
  { key: "arrival", label: "Arrival notice", hint: "Vessel arrived at Sulina roads", to: "office" },
  { key: "berthing", label: "Berthing report", hint: "Vessel berthed at the port", to: "office" },
  { key: "sailing", label: "Sailing report", hint: "Vessel departed", to: "office" },
  { key: "payment", label: "Payment reminder", hint: "Disbursements still unpaid", to: "office" },
];

/** Templates that fit the vessel's current stage, shown first */
export function suggestedTemplates(v: VesselView): TemplateKey[] {
  const unpaid = v.paid !== true;
  switch (v.stage) {
    case "expected":
      return v.pdaSent ? ["prearrival"] : ["prearrival", "pda"];
    case "at_roads":
      return ["arrival"];
    case "in_port":
      return unpaid ? ["berthing", "payment"] : ["berthing"];
    case "departed":
      return isUnpaidAfterDeparture(v) ? ["sailing", "payment"] : ["sailing"];
  }
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

const yesNo = (b: boolean | null) => (b ? "yes" : "not yet");

function vesselLine(v: VesselView): string {
  const parts = [`MV ${v.name}`, v.imo ? `IMO ${v.imo}` : null, TYPE_LABEL[v.type], v.condition ? CONDITION_LABEL[v.condition] : null];
  return parts.filter(Boolean).join(" / ");
}

export function buildEmail(key: TemplateKey, v: VesselView, sender: string): EmailDraft {
  const tpl = EMAIL_TEMPLATES.find((t) => t.key === key) ?? EMAIL_TEMPLATES[0];
  const port = DESTINATION_LABEL[v.destination];
  const to = (tpl.to === "master" ? v.masterEmail : v.officeEmail) ?? "";
  const greeting = tpl.to === "master" ? `Dear Captain${v.masterName ? ` ${v.masterName}` : ""},` : `Dear ${v.officeName || "Sirs"},`;
  const sign = `\n\nBest regards,\n${sender}\nAvalon Shipping SRL`;
  const head = `${greeting}\n\nGood day.\n\nRe: ${vesselLine(v)} — ${port} via Sulina\n\n`;

  const bodies: Record<TemplateKey, { subject: string; text: string }> = {
    prearrival: {
      subject: `Pre-arrival information — MV ${v.name} / ${port}`,
      text:
        `We are pleased to act as your agents at ${port}. Kindly send us before arrival:\n` +
        "- ETA Sulina and arrival drafts fwd/aft\n- Crew list and passenger list\n- Ship's particulars and last 10 ports of call\n" +
        "- Cargo manifest / B/L copies\n- ISPS security declaration and MARPOL waste declaration\n\n" +
        `ETA Sulina on our side: ${fmtFull(v.etaSulina)}.`,
    },
    pda: {
      subject: `PDA — MV ${v.name} / ${port}`,
      text:
        `Please find attached our proforma disbursement account for the call at ${port} via Sulina.\n` +
        `Kindly arrange the remittance before the vessel's arrival (ETA Sulina ${fmtFull(v.etaSulina)}) and confirm by return.`,
    },
    arrival: {
      subject: `Arrival notice — MV ${v.name} at Sulina roads`,
      text:
        `Please be advised that the vessel arrived at Sulina roads on ${fmtFull(v.arrivedAt)}.\n` +
        `Sulina pilotage arranged: ${yesNo(v.pilotageArranged)}${v.pilot ? ` (${v.pilot})` : ""}.\n` +
        `Prearrival documents: ${v.prearrivalsIn === "ok" ? "OK" : "pending"}. We will keep you posted on the passage to ${port}.`,
    },
    berthing: {
      subject: `Berthing report — MV ${v.name} at ${port}`,
      text: `Please be advised that the vessel berthed at ${port} on ${fmtFull(v.inPortAt)}.\nWe will revert with the cargo operations schedule.`,
    },
    sailing: {
      subject: `Sailing report — MV ${v.name} / ${port}`,
      text:
        `Please be advised that the vessel sailed from ${port} on ${fmtFull(v.departedAt)}.\n` +
        `Departure documents: ${v.prearrivalsOut === "ok" ? "OK" : "pending"}, MSW out: ${yesNo(v.mswOut)}.\n` +
        "Our final disbursement account will follow.",
    },
    payment: {
      subject: `Payment reminder — MV ${v.name} / ${port}`,
      text:
        "Kindly note that the disbursements for this call are still outstanding on our side.\n" +
        "We would appreciate your remittance at your earliest convenience and a copy of the payment slip.",
    },
  };

  const b = bodies[key];
  return { to, subject: b.subject, body: `${head}${b.text}${sign}` };
}

export function mailtoHref(d: EmailDraft): string {
  return `mailto:${encodeURI(d.to.trim())}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`;
}
