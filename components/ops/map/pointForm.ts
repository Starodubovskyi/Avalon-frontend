import type { ActivityCode } from "@/lib/points/activities";
import { pointTitle, type PointKind, type PointVisibility, type TeamPoint, type TeamPointInput } from "@/lib/points/team-points";

/** State, validation and payload of the point form (PointFormDialog) */

export interface PointFormState {
  kind: PointKind;
  title: string;
  activities: ActivityCode[];
  /** undefined keeps the stored logo, a data URL replaces it, null removes it */
  newLogo: string | null | undefined;
  phone: string;
  email: string;
  address: string;
  visibility: PointVisibility;
  /** the user picked the visibility: changing the kind no longer re-defaults it */
  visibilityTouched: boolean;
  description: string;
  website: string;
  /** "" when there is none or the stored one is not among the choosable head offices */
  parentId: string;
  /** the user changed the parent company in this dialog */
  parentTouched: boolean;
}

/** Backend default per kind: a person pin is team-only, everything else public */
export function defaultVisibility(kind: PointKind): PointVisibility {
  return kind === "private_person" ? "team" : "public";
}

export function initialPointForm(point: TeamPoint | null | undefined, kind: PointKind): PointFormState {
  return {
    kind: point?.kind ?? kind,
    title: point ? pointTitle(point) : "",
    activities: point?.activities ?? [],
    newLogo: undefined,
    phone: point?.phone ?? "",
    email: point?.email ?? "",
    address: point?.address ?? "",
    visibility: point?.visibility ?? defaultVisibility(kind),
    // follows the kind until the user picks it in this dialog
    visibilityTouched: false,
    description: point?.description ?? "",
    website: point?.website ?? "",
    parentId: point?.parentId ?? "",
    parentTouched: false,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "avalon.ro" → "https://avalon.ro"; empty stays empty */
export function normalizeWebsite(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function isWebsite(v: string): boolean {
  if (!v) return true;
  try {
    const url = new URL(v);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Dictionary key (points: form.errors.*) of the first problem, or null */
export function validatePointForm(form: PointFormState): string | null {
  if (!form.title.trim()) return "form.errors.title";
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) return "form.errors.email";
  if (!isWebsite(normalizeWebsite(form.website))) return "form.errors.website";
  return null;
}

export function pointFormInput(form: PointFormState, point: TeamPoint | null | undefined): TeamPointInput {
  const input: TeamPointInput = {
    kind: form.kind,
    firstName: form.title.trim(),
    // codes replace the legacy free-text activity for good once the point is saved from this form
    activity: "",
    activities: form.activities,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    address: form.address.trim() || null,
    // always explicit: without it the backend re-defaults by kind
    visibility: form.visibility,
    description: form.description.trim() || null,
    website: normalizeWebsite(form.website) || null,
  };
  // only a branch has a head office; an unchanged parent is not sent (the backend re-checks every sent one)
  const parent = form.kind === "branch" && form.parentId ? form.parentId : null;
  if (!point) {
    if (parent) input.parentId = parent;
  } else if (parent !== (point.parentId ?? null) && (form.parentTouched || form.kind !== "branch")) {
    input.parentId = parent;
  }
  // the title now holds the full name of legacy people; their separate last name is cleared
  if (point?.lastName) input.lastName = "";
  // the logo travels only when it changed (it can be up to 150 KB)
  if (typeof form.newLogo === "string" || (form.newLogo === null && point?.hasLogo)) input.logo = form.newLogo;
  return input;
}

/** Best-effort street address for a new pin (Mapbox reverse geocoding, public token) */
export async function reverseGeocode([lng, lat]: [number, number], signal: AbortSignal, language: string): Promise<string | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  if (!token) return null;
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&limit=1&language=${language}&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const body: unknown = await res.json();
  const feature = (body as { features?: { properties?: { full_address?: string; place_formatted?: string } }[] }).features?.[0];
  return feature?.properties?.full_address ?? feature?.properties?.place_formatted ?? null;
}
