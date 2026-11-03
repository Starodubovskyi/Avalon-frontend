import { useCallback } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";

/** Kinds of failure the interface words itself — keys under common.errors.* */
export type ErrorKind = "offline" | "sessionExpired" | "forbidden" | "notFound" | "tooLarge" | "validation" | "server" | "generic";

/**
 * Classifies a failed call by HTTP status. Server messages and error.message are never shown:
 * they are English, technical (codes, stack-ish text) and sometimes internal.
 */
export function errorKind(error: unknown): ErrorKind {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === undefined) return "offline";
    if (status === 401) return "sessionExpired";
    if (status === 403) return "forbidden";
    if (status === 404) return "notFound";
    if (status === 413) return "tooLarge";
    if (status === 400 || status === 422) return "validation";
    if (status >= 500) return "server";
  }
  return "generic";
}

/** `(error) => sentence` in the interface language, for toasts, banners and form fallbacks */
export function useErrorText() {
  const t = useTranslations("common.errors");
  return useCallback((error: unknown) => t(errorKind(error)), [t]);
}
