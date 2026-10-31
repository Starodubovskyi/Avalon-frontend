"use client";

import { useSyncExternalStore } from "react";
import { DEMO_CHANGE_EVENT, DEMO_FLAG_KEY, isDemoActive } from "./mode";

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === DEMO_FLAG_KEY || e.key === null) onChange();
  };
  window.addEventListener(DEMO_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DEMO_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Whether the app currently runs on demo data (always false during SSR) */
export function useDemoActive(): boolean {
  return useSyncExternalStore(subscribe, isDemoActive, () => false);
}
