import { POINT_KINDS, POINT_VISIBILITIES } from "@/lib/points/team-points";
import { isActivityCode, type ActivityCode } from "@/lib/points/activities";
import { DESCRIPTION_MAX, LOGO_MAX_CHARS, LOGO_MIME_TYPES, TITLE_MAX, WEBSITE_MAX } from "@/lib/points/limits";
import { invalid, isUuid } from "../http";

/** DTO validation of POST/PATCH /map-points, field by field as the backend's class-validator does it */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGO_RE = /^data:([a-z]+\/[a-z]+);base64,([A-Za-z0-9+/]+={0,2})$/;

type TextField = "firstName" | "lastName" | "activity" | "phone" | "email" | "address" | "notes";
export type PointField = TextField | "kind" | "lat" | "lng" | "activities" | "logo" | "visibility" | "description" | "website" | "parentId";
export type ParsedPoint = Partial<Record<PointField, unknown>>;

/** Legacy text columns where "" is a value (clears the stored text), not "not given" */
const CLEARABLE: readonly TextField[] = ["lastName", "activity"];
const TEXT_MAX: Record<TextField, number> = { firstName: TITLE_MAX, lastName: 255, activity: 255, phone: 50, email: 255, address: 500, notes: 2000 };

/** IsPresent + IsActivityCodes: absent is fine, null / not an array / unknown code → invalid; duplicates dropped */
function parseActivities(v: unknown, errors: Record<string, string>): ActivityCode[] | undefined {
  if (v === undefined) return undefined;
  if (!Array.isArray(v) || !v.every(isActivityCode)) {
    errors.activities = "invalid";
    return undefined;
  }
  return v.filter((c, i) => v.indexOf(c) === i);
}

/** IsOptional + IsImageDataUrl: null or "" clears; tooLong is checked before the format */
function parseLogo(v: unknown, errors: Record<string, string>): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (typeof v !== "string") errors.logo = "invalid";
  else if (v.length > LOGO_MAX_CHARS) errors.logo = "tooLong";
  else {
    const mime = LOGO_RE.exec(v)?.[1] ?? "";
    if (!(LOGO_MIME_TYPES as readonly string[]).includes(mime)) errors.logo = "invalid";
    else return v;
  }
  return undefined;
}

/** description / website: "" or null clears; website must be an http(s) URL */
function parseProfileFields(body: Record<string, unknown>, out: ParsedPoint, errors: Record<string, string>): void {
  const description = body.description;
  if (description !== undefined) {
    if (description === null || (typeof description === "string" && !description.trim())) out.description = null;
    else if (typeof description !== "string") errors.description = "invalid";
    else if (description.trim().length > DESCRIPTION_MAX) errors.description = "tooLong";
    else out.description = description.trim();
  }
  const website = body.website;
  if (website !== undefined) {
    if (website === null || (typeof website === "string" && !website.trim())) out.website = null;
    else if (typeof website !== "string" || !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(website.trim())) errors.website = "invalid";
    else if (website.trim().length > WEBSITE_MAX) errors.website = "tooLong";
    else out.website = website.trim();
  }
  const visibility = body.visibility;
  if (visibility !== undefined) {
    if (typeof visibility === "string" && (POINT_VISIBILITIES as readonly string[]).includes(visibility)) out.visibility = visibility;
    else errors.visibility = "invalid";
  }
  const parentId = body.parentId;
  if (parentId !== undefined) {
    if (parentId === null || parentId === "") out.parentId = null;
    else if (isUuid(parentId)) out.parentId = parentId;
    else errors.parentId = "invalid";
  }
}

/** Empty strings count as "not given" (emptyToUndefined); notes clear to null, lastName/activity to "" */
export function parsePoint(body: Record<string, unknown>, partial: boolean): ParsedPoint {
  const out: ParsedPoint = {};
  const errors: Record<string, string> = {};
  const raw = (f: TextField | "kind" | "lat" | "lng") => {
    const v = body[f];
    if (typeof v !== "string" || v.trim() !== "") return v;
    if (f === "notes") return null;
    return (CLEARABLE as readonly string[]).includes(f) ? "" : undefined;
  };
  const kind = raw("kind");
  if (kind !== undefined) {
    if (typeof kind === "string" && (POINT_KINDS as readonly string[]).includes(kind)) out.kind = kind;
    else errors.kind = `kind must be one of the following values: ${POINT_KINDS.join(", ")}`;
  }
  for (const [f, min, max] of [["lat", -90, 90], ["lng", -180, 180]] as const) {
    const v = raw(f);
    if (v === undefined) {
      if (!partial) errors[f] = `${f} must not be less than ${min}`;
      continue;
    }
    const n = typeof v === "string" ? Number(v) : v;
    if (typeof n !== "number" || !Number.isFinite(n)) errors[f] = `${f} must be a number conforming to the specified constraints`;
    else if (n < min || n > max) errors[f] = `${f} must not be ${n < min ? `less than ${min}` : `greater than ${max}`}`;
    else out[f] = n;
  }
  for (const f of ["firstName", "lastName", "activity", "phone", "email", "address", "notes"] as const) {
    const v = raw(f);
    if (v === undefined) {
      if (f === "firstName" && !partial) errors.firstName = "firstName should not be empty";
      continue;
    }
    // IsOptional lets null through: contact fields clear, name-like columns are NOT NULL
    if (v === null) {
      if (f === "firstName") errors.firstName = "firstName should not be empty";
      else out[f] = f === "lastName" || f === "activity" ? "" : null;
      continue;
    }
    if (typeof v !== "string") errors[f] = `${f} must be a string`;
    else if (v.length > TEXT_MAX[f]) errors[f] = `${f} must be shorter than or equal to ${TEXT_MAX[f]} characters`;
    else if (f === "email" && !EMAIL_RE.test(v)) errors.email = "email must be an email";
    else out[f] = v;
  }
  const activities = parseActivities(body.activities, errors);
  if (activities !== undefined) out.activities = activities;
  const logo = parseLogo(body.logo, errors);
  if (logo !== undefined) out.logo = logo;
  parseProfileFields(body, out, errors);
  if (Object.keys(errors).length) invalid(errors);
  return out;
}
