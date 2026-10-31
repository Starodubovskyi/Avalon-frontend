import { DEMO_DB_KEY } from "./mode";
import { seedDemoState } from "./seed";
import type { DemoState } from "./types";

/** In-memory demo database, persisted to localStorage after every change */

let state: DemoState | null = null;
let dirty = false;
let listening = false;

function isDemoState(value: unknown): value is DemoState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<DemoState>;
  return (
    v.version === 1 &&
    Array.isArray(v.users) &&
    Array.isArray(v.vessels) &&
    Array.isArray(v.agencyRequests) &&
    Array.isArray(v.pendingReplies)
  );
}

function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(DEMO_DB_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDemoState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Another tab changed or reset the demo: re-read it on the next request */
function listenToOtherTabs() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("storage", (e) => {
    if (e.key === DEMO_DB_KEY || e.key === null) state = null;
  });
}

export function getState(): DemoState {
  listenToOtherTabs();
  if (state) return state;
  const loaded = load();
  if (loaded) {
    state = loaded;
  } else {
    state = seedDemoState(new Date());
    dirty = true;
  }
  return state;
}

export function markDirty(): void {
  dirty = true;
}

export function persistIfDirty(): void {
  if (!dirty || !state) return;
  dirty = false;
  try {
    window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(state));
  } catch {
    /* quota or blocked storage: the demo keeps working in memory */
  }
}

/** Drops all demo changes; the next request seeds a fresh database */
export function resetDemoDb(): void {
  state = null;
  dirty = false;
  try {
    window.localStorage.removeItem(DEMO_DB_KEY);
  } catch {
    /* nothing persisted */
  }
}
