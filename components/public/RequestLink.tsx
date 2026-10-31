"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/useAuth";

/**
 * Link to the agency form that keeps its prefill query through sign-in:
 * guests go to /auth with the full /request?… as `next`.
 */
export function requestHref(query: string, signedIn: boolean): string {
  const target = query ? `/request?${query}` : "/request";
  return signedIn ? target : `/auth?next=${encodeURIComponent(target)}`;
}

export function RequestLink({ query = "", className, children }: { query?: string; className?: string; children: ReactNode }) {
  const { user } = useAuth();
  return (
    <Link href={requestHref(query, !!user)} className={className}>
      {children}
    </Link>
  );
}
