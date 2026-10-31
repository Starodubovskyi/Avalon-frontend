"use client";

import axios from "axios";
import api from "@/lib/api/client";
import { networkError } from "@/lib/network/api";
import type {
  AgencyRequest,
  CreateAgencyRequestDto,
  RequestStatus,
  UpdateAgencyRequestDto,
} from "./types";

export const AgencyRequestsApi = {
  async list(status?: RequestStatus): Promise<AgencyRequest[]> {
    const { data } = await api.get<AgencyRequest[]>("/agency-requests", { params: status ? { status } : {} });
    return data;
  },

  async get(id: string): Promise<AgencyRequest> {
    const { data } = await api.get<AgencyRequest>(`/agency-requests/${encodeURIComponent(id)}`);
    return data;
  },

  async create(input: CreateAgencyRequestDto): Promise<AgencyRequest> {
    const { data } = await api.post<AgencyRequest>("/agency-requests", input);
    return data;
  },

  async update(id: string, input: UpdateAgencyRequestDto): Promise<AgencyRequest> {
    const { data } = await api.patch<AgencyRequest>(`/agency-requests/${encodeURIComponent(id)}`, input);
    return data;
  },
};

const FIELD_KEYS = [
  "company",
  "contactName",
  "email",
  "phone",
  "vesselName",
  "imo",
  "vesselType",
  "destination",
  "eta",
  "cargo",
  "notes",
  "staffNote",
  "vesselId",
  "status",
] as const satisfies readonly (keyof CreateAgencyRequestDto | keyof UpdateAgencyRequestDto)[];

export type FieldKey = (typeof FIELD_KEYS)[number];
export type FieldErrors = Partial<Record<FieldKey, string>>;

export const EMAIL_HINT = "Enter a valid email address — no ?, &, %, # or spaces";

/** 422 codes from the boilerplate ({ errors: { field: code } }) in plain words */
const CODE_TEXT: Record<string, string> = {
  empty: "Required",
  invalidEmail: EMAIL_HINT,
  imoInvalid: "IMO is exactly 7 digits",
  imoAlreadyExists: "This IMO is already on the board",
  tooLong: "Too long — shorten it",
  invalidDateTime: "Pick a valid date and time",
  notFound: "Not found — it may have been removed",
  invalid: "Check this value",
};

const FALLBACK_TEXT = "Check this value";

/** Raw `{ field: code }` of a 422 response, or null for any other failure */
export function validationCodes(error: unknown): Record<string, string> | null {
  if (!axios.isAxiosError<{ errors?: unknown }>(error) || error.response?.status !== 422) return null;
  const errors = error.response.data?.errors;
  if (typeof errors !== "object" || errors === null) return null;
  const out: Record<string, string> = {};
  for (const [field, code] of Object.entries(errors)) if (typeof code === "string") out[field] = code;
  return out;
}

/** Per-field messages (known fields only) from a 422 response, or null when it is not a validation error */
export function requestFieldErrors(error: unknown): FieldErrors | null {
  const codes = validationCodes(error);
  if (!codes) return null;
  const out: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    const code = codes[key];
    if (code !== undefined) out[key] = CODE_TEXT[code] ?? FALLBACK_TEXT;
  }
  return out;
}

/** True when creating a board vessel failed because its IMO is already there */
export function isDuplicateImo(error: unknown): boolean {
  return validationCodes(error)?.imo === "imoAlreadyExists";
}

/** Human message for a failed request call */
export function requestError(error: unknown): string {
  if (isDuplicateImo(error)) return "This IMO is already on the board — open the existing vessel";
  if (requestFieldErrors(error)) return "Some fields need attention";
  return networkError(error);
}
