import type { AuthUser } from "@/lib/domain/map-point";
import { fmtEur, normalizePdaInput } from "@/lib/public/pdaTariffs";
import { fromLocalInput } from "@/lib/vessels/format";
import { EMAIL_HINT, type FieldErrors } from "./api";
import { REQUEST_LIMITS, type CreateAgencyRequestDto } from "./types";
import {
  CONDITION_LABEL,
  DESTINATIONS,
  VESSEL_TYPES,
  type Destination,
  type VesselType,
} from "@/lib/vessels/types";

/** Form state of the agency request — strings only, converted to the DTO on submit */
export interface RequestFormState {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  vesselName: string;
  imo: string;
  vesselType: VesselType;
  destination: Destination;
  /** datetime-local value */
  eta: string;
  cargo: string;
  notes: string;
}

export const EMPTY_REQUEST_FORM: RequestFormState = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  vesselName: "",
  imo: "",
  vesselType: "general_cargo",
  destination: "GALATI",
  eta: "",
  cargo: "",
  notes: "",
};

interface QueryLike {
  get(name: string): string | null;
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((a) => a === value);
}

/** Sentence for the notes field when the client arrives from the PDA estimator */
export function estimateNote(params: QueryLike): string {
  if (!params.get("gt") && !params.get("estimate")) return "";
  const input = normalizePdaInput({
    port: params.get("destination"),
    vesselType: params.get("vesselType"),
    gt: params.get("gt"),
    loa: params.get("loa"),
    days: params.get("days"),
    condition: params.get("condition"),
  });
  const total = Number(params.get("estimate"));
  const parts = [
    `GT ${input.gt.toLocaleString("en-GB")}`,
    `LOA ${input.loa} m`,
    `${input.days} ${input.days === 1 ? "day" : "days"} alongside`,
    CONDITION_LABEL[input.condition].toLowerCase(),
  ];
  const totalText = Number.isFinite(total) && total > 0 ? ` Online estimate: ${fmtEur(total)}.` : "";
  return `Please send a firm PDA: ${parts.join(", ")}.${totalText}`;
}

/**
 * Contact details come only from the signed-in profile — a crafted link must not be able to
 * plant someone else's email or company. The query may carry vessel and estimate fields.
 */
export function initialRequestForm(params: QueryLike | null, user: AuthUser | null): RequestFormState {
  const q = params ?? { get: () => null };
  return {
    ...EMPTY_REQUEST_FORM,
    contactName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    email: user?.email ?? "",
    vesselName: (q.get("vesselName") ?? "").toUpperCase(),
    imo: (q.get("imo") ?? "").replace(/\D/g, "").slice(0, 7),
    vesselType: oneOf(q.get("vesselType"), VESSEL_TYPES) ?? EMPTY_REQUEST_FORM.vesselType,
    destination: oneOf(q.get("destination"), DESTINATIONS) ?? EMPTY_REQUEST_FORM.destination,
    notes: estimateNote(q),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Same as the backend IsMailtoSafeEmail: these change or break a mailto: link */
const MAILTO_UNSAFE = /[?&%#/\\\s]/;
const IMO_RE = /^\d{7}$/;
const REQUIRED = ["company", "contactName", "email", "vesselName"] as const;
const LIMITED = ["company", "contactName", "email", "phone", "vesselName", "cargo", "notes"] as const;

/** Same rules as the backend DTO, so most mistakes never reach the server */
export function validateRequestForm(f: RequestFormState): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of REQUIRED) if (!f[key].trim()) errors[key] = "Required";
  const email = f.email.trim();
  if (email && (!EMAIL_RE.test(email) || MAILTO_UNSAFE.test(email))) errors.email = EMAIL_HINT;
  if (f.imo.trim() && !IMO_RE.test(f.imo.trim())) errors.imo = "IMO is exactly 7 digits";
  if (f.eta && !fromLocalInput(f.eta)) errors.eta = "Pick a valid date and time";
  for (const key of LIMITED) {
    if (f[key].trim().length > REQUEST_LIMITS[key]) errors[key] = `Up to ${REQUEST_LIMITS[key]} characters`;
  }
  return errors;
}

const orNull = (v: string) => (v.trim() ? v.trim() : null);

export function toCreateDto(f: RequestFormState): CreateAgencyRequestDto {
  return {
    company: f.company.trim(),
    contactName: f.contactName.trim(),
    email: f.email.trim(),
    phone: orNull(f.phone),
    vesselName: f.vesselName.trim().toUpperCase(),
    imo: orNull(f.imo),
    vesselType: f.vesselType,
    destination: f.destination,
    eta: fromLocalInput(f.eta),
    cargo: orNull(f.cargo),
    notes: orNull(f.notes),
  };
}
