import type { AxiosAdapter } from "axios";

/**
 * Demo mode switch. Kept tiny on purpose: it is imported by the shared axios client,
 * the mock backend itself is loaded lazily only when a demo request is made.
 *
 * NEXT_PUBLIC_DEMO_MODE:
 *  - "off"       demo is never available (real backend only)
 *  - "fallback"  default: real backend, demo can be entered from the login page
 *  - "only"      the app always runs on demo data and never calls the network
 */
export type DemoEnvMode = "off" | "fallback" | "only";
export type DemoRole = "admin" | "staff" | "viewer";

export const DEMO_FLAG_KEY = "avalon:demo";
export const DEMO_DB_KEY = "avalon:demo:db:v1";
/** Fired on window when demo is entered, exited or reset */
export const DEMO_CHANGE_EVENT = "avalon:demochange";

const TOKEN_PREFIX = "demo.";

/** Unset means "fallback"; an unrecognised value fails closed to "off" */
export function demoEnvMode(): DemoEnvMode {
  const raw = (process.env.NEXT_PUBLIC_DEMO_MODE ?? "").trim().toLowerCase();
  if (raw === "") return "fallback";
  return raw === "fallback" || raw === "only" || raw === "off" ? raw : "off";
}

export function isDemoAvailable(): boolean {
  return demoEnvMode() !== "off";
}

function readFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/** True when API calls must be answered by the in-browser mock backend */
export function isDemoActive(): boolean {
  const mode = demoEnvMode();
  if (mode === "off") return false;
  if (mode === "only") return true;
  return readFlag();
}

export function setDemoFlag(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(DEMO_FLAG_KEY, "1");
    else window.localStorage.removeItem(DEMO_FLAG_KEY);
  } catch {
    /* storage blocked: demo then lasts for this page only */
  }
  window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
}

export function demoToken(userId: number): string {
  return `${TOKEN_PREFIX}${userId}`;
}

export function isDemoToken(token: string | null | undefined): boolean {
  return !!token && token.replace(/^Bearer\s+/i, "").startsWith(TOKEN_PREFIX);
}

export function demoUserIdFromToken(token: string | null | undefined): number | null {
  if (!token || !isDemoToken(token)) return null;
  const id = Number(token.replace(/^Bearer\s+/i, "").slice(TOKEN_PREFIX.length));
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Axios adapter that loads the mock backend on first use */
export const lazyDemoAdapter: AxiosAdapter = (config) =>
  import("./adapter").then(({ demoAdapter }) => demoAdapter(config));
