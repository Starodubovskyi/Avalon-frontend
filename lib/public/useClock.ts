"use client";

import { useEffect, useState } from "react";

/**
 * Ticking clock that is null until mounted: server and first client render agree,
 * so live local times never cause a hydration mismatch.
 */
export function useClock(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
