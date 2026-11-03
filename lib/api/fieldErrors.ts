"use client";

import { useCallback } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";

/** Field → the 422 codes a section knows how to word (boilerplate shape: { status: 422, errors: { field: code } }) */
export type KnownFieldErrors = Readonly<Record<string, readonly string[]>>;

/** First known 422 code as "field.code" (the dictionary key under errors.*), else null */
export function fieldErrorCode(e: unknown, known: KnownFieldErrors): string | null {
  if (!axios.isAxiosError(e) || e.response?.status === undefined) return null;
  const errors: unknown = (e.response.data as { errors?: unknown } | undefined)?.errors;
  if (!errors || typeof errors !== "object") return null;
  for (const [field, codes] of Object.entries(known)) {
    const code = (errors as Record<string, unknown>)[field];
    if (typeof code === "string" && codes.includes(code)) return `${field}.${code}`;
  }
  return null;
}

/** HTTP status of a failed call; null when the server was not reached at all */
export function httpStatus(e: unknown): number | null {
  if (!axios.isAxiosError(e)) return 0;
  return e.response?.status ?? null;
}

/**
 * Turns a failed API call into a sentence of the given namespace. The namespace provides
 * errors.<field>.<code> for the known codes plus errors.forbidden / notFound / offline / generic.
 */
export function useApiErrorText(namespace: string, known: KnownFieldErrors) {
  const t = useTranslations(namespace);
  return useCallback(
    (e: unknown): string => {
      const code = fieldErrorCode(e, known);
      if (code) return t(`errors.${code}`);
      const status = httpStatus(e);
      if (status === 403) return t("errors.forbidden");
      if (status === 404) return t("errors.notFound");
      if (status === null) return t("errors.offline");
      return t("errors.generic");
    },
    [t, known],
  );
}
