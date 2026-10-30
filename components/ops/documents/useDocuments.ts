"use client";

import useSWR, { useSWRConfig } from "swr";
import { useCallback } from "react";
import { DocumentsApi, type DocumentQuery } from "@/lib/api/documents";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";

export function useDocuments(query: DocumentQuery = {}) {
  const { user } = useAuth();
  const key = canEdit(user)
    ? (["documents", query.vesselId ?? "", query.category ?? "", query.search ?? ""] as const)
    : null;
  return useSWR(key, () => DocumentsApi.list(query), { keepPreviousData: true });
}

export function useRefreshDocuments() {
  const { mutate } = useSWRConfig();
  return useCallback(
    () => mutate((key) => Array.isArray(key) && key[0] === "documents"),
    [mutate],
  );
}
