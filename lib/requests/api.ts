"use client";

import axios from "axios";
import api from "@/lib/api/client";
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

/** Translator of the "requests" namespace — pass `useTranslations("requests")` */
export type RequestsT = (key: string, values?: Record<string, string | number>) => string;

/** 422 codes from the boilerplate ({ errors: { field: code } }) → message keys under requests.errors */
const CODE_KEY: Record<string, string> = {
  empty: "errors.required",
  invalidEmail: "errors.email",
  imoInvalid: "errors.imo",
  imoAlreadyExists: "errors.imoExists",
  tooLong: "errors.tooLong",
  invalidDateTime: "errors.dateTime",
  notFound: "errors.notFound",
  invalid: "errors.invalid",
};

const FALLBACK_KEY = "errors.invalid";

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
export function requestFieldErrors(error: unknown, t: RequestsT): FieldErrors | null {
  const codes = validationCodes(error);
  if (!codes) return null;
  const out: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    const code = codes[key];
    if (code !== undefined) out[key] = t(CODE_KEY[code] ?? FALLBACK_KEY);
  }
  return out;
}

/** True when creating a board vessel failed because its IMO is already there */
export function isDuplicateImo(error: unknown): boolean {
  return validationCodes(error)?.imo === "imoAlreadyExists";
}

/** Human message for a failed request call, in the interface language */
export function requestError(error: unknown, t: RequestsT): string {
  if (isDuplicateImo(error)) return t("errors.imoExistsOpen");
  if (validationCodes(error)) return t("errors.attention");
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!error.response) return t("errors.offline");
    if (status === 401) return t("errors.sessionExpired");
    if (status === 403) return t("errors.forbidden");
    if (status === 404) return t("errors.gone");
  }
  return t("errors.generic");
}
