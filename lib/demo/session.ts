"use client";

import axios from "axios";
import api, { clearAuth, getAccessToken, setTokens } from "@/lib/api/client";
import { DEMO_CHANGE_EVENT, demoToken, isDemoActive, isDemoToken, setDemoFlag, type DemoRole } from "./mode";
import { DEMO_USER_IDS } from "./seed/users";

/** Entering and leaving demo. A demo session always replaces the real one and never coexists with it. */

const SESSION_MS = 12 * 3_600_000;
const LOGOUT_WAIT_MS = 3_000;

/**
 * POST /auth/logout for the real session, bounded and without the shared client's interceptors:
 * a late 401 refresh or AuthApi.logout's clearAuth must not land after the demo token is set.
 */
async function endRealSession(token: string): Promise<void> {
  try {
    await axios.post("/auth/logout", null, {
      baseURL: api.defaults.baseURL,
      withCredentials: api.defaults.withCredentials,
      headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` },
      timeout: LOGOUT_WAIT_MS,
    });
  } catch {
    /* server down or session already gone: the local session is dropped anyway */
  }
}

/** Signs in as the demo account of `role` (restored if it was deleted or re-roled inside the demo) */
export async function enterDemo(role: DemoRole): Promise<void> {
  // end a real session on the server before replacing it (best effort: it may be down)
  const current = getAccessToken();
  if (current && !isDemoToken(current) && !isDemoActive()) await endRealSession(current);
  clearAuth();
  setDemoFlag(true);
  const { prepareDemoAccount } = await import("./accounts");
  const userId = prepareDemoAccount(role);
  setTokens(demoToken(userId), `demo-refresh.${userId}`, Date.now() + SESSION_MS);
}

/**
 * Drops the demo session and the flag; the caller navigates to the login page right after.
 * Silent clear: an in-tab "authchange" would make AppShell start a soft redirect that the hard one aborts.
 */
export function exitDemo(): void {
  setDemoFlag(false);
  clearAuth({ notify: false });
  try {
    for (const id of DEMO_USER_IDS) window.localStorage.removeItem(`user_points:${id}`);
  } catch {
    /* storage blocked */
  }
}

/** Throws away every demo change; the next request seeds a fresh database */
export async function resetDemo(): Promise<void> {
  const { resetDemoDb } = await import("./db");
  resetDemoDb();
  window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
}

export const DEMO_ROLES: { role: DemoRole; label: string; hint: string }[] = [
  { role: "admin", label: "Admin", hint: "Everything, incl. team" },
  { role: "staff", label: "Staff", hint: "Operations team" },
  { role: "viewer", label: "Viewer", hint: "Owner / charterer" },
];

/** Network error or 5xx: the backend is down, not the credentials wrong */
export function isServerUnavailable(err: unknown): boolean {
  return axios.isAxiosError(err) && (!err.response || err.response.status >= 500);
}

