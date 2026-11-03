import api from "@/lib/api/client";
import type { KnownFieldErrors } from "@/lib/api/fieldErrors";
import type { UserRef } from "@/lib/vessels/types";
import { activityFromText, toActivityCodes, type ActivityCode } from "./activities";
import { POINT_KIND_COLORS as KIND_COLORS } from "./kind-colors";

/**
 * Points on the fleet map (backend /map-points). Everyone signed in sees public points and their own;
 * the team sees all. Labels live in the "points" dictionary (lib/points/labels.ts).
 */
export const POINT_KINDS = ["head_office", "branch", "self_employed", "for_sale", "authority", "private_person"] as const;
export type PointKind = (typeof POINT_KINDS)[number];

/** Kind preselected in the "Add point" form and the Companies "Add on map" link */
export const DEFAULT_FORM_KIND: PointKind = "head_office";
/** Kind the API stores when none is sent (backend DEFAULT_MAP_POINT_KIND); also the fallback for unknown kinds */
export const DEFAULT_POINT_KIND: PointKind = "private_person";

/** public: everyone signed in; team: the Avalon team and the owner (backend MAP_POINT_VISIBILITIES) */
export const POINT_VISIBILITIES = ["public", "team"] as const;
export type PointVisibility = (typeof POINT_VISIBILITIES)[number];

/** Canvas colours for map markers (lib/points/kind-colors.ts, shared with Tailwind point.*) */
export const POINT_KIND_COLORS: Record<PointKind, { base: string; light: string; dark: string }> = KIND_COLORS;

/** Old kinds (before GeoPointsV2) mapped the way the migration does */
const LEGACY_KIND: Record<string, PointKind> = {
  company: "head_office",
  agency: "head_office",
  terminal: "branch",
  authority: "authority",
  person: "private_person",
  employee: "private_person",
};

export function toPointKind(value: unknown): PointKind {
  if (typeof value !== "string") return DEFAULT_POINT_KIND;
  if ((POINT_KINDS as readonly string[]).includes(value)) return value as PointKind;
  return LEGACY_KIND[value] ?? DEFAULT_POINT_KIND;
}

/** Author of a point; email is null unless the caller may see it (team, team author, or themselves) */
export type PointAuthor = UserRef & { role?: "admin" | "staff" | "viewer" };

/** MapPointView of the contract */
export interface TeamPoint {
  id: string;
  kind: PointKind;
  lat: number;
  lng: number;
  /** Title of the point */
  firstName: string;
  /** Legacy: people had a separate last name; new points keep it empty */
  lastName: string;
  /** Legacy free text, shown only when no activity code is set */
  activity: string;
  activities: ActivityCode[];
  /** The image itself comes from GET /map-points/:id/logo?v=<logoVersion> (lib/points/logo-cache.ts) */
  hasLogo: boolean;
  /** Changes whenever the logo changes; null without a logo */
  logoVersion: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isFavorite: boolean;
  /** Rank of the author of the point */
  rank: number;
  createdBy: PointAuthor | null;
  createdAt: string;
  updatedAt: string;
  visibility: PointVisibility;
  description: string | null;
  website: string | null;
  /** Head office of a branch */
  parentId: string | null;
  /** Business Activity slots (1 free, up to 14) */
  activitySlots: number;
  emailVerified: boolean;
  /** The caller may edit / delete it (owner or the team) */
  canEdit: boolean;
  /** Active people of the company profile, the owner included */
  memberCount: number;
}

export interface TeamPointInput {
  kind?: PointKind;
  lat?: number;
  lng?: number;
  firstName?: string;
  /** Sent only to clear a legacy last name */
  lastName?: string;
  /** Legacy free text: the form sends "" so an edited point shows only its activity codes */
  activity?: string;
  activities?: ActivityCode[];
  /** New logo as a data URL, null removes it; omitted keeps the stored one */
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  visibility?: PointVisibility;
  description?: string | null;
  website?: string | null;
  parentId?: string | null;
}

type NormalizedKeys =
  | "kind"
  | "activities"
  | "hasLogo"
  | "logoVersion"
  | "isFavorite"
  | "rank"
  | "lastName"
  | "activity"
  | "visibility"
  | "description"
  | "website"
  | "parentId"
  | "activitySlots"
  | "emailVerified"
  | "canEdit"
  | "memberCount";

export type RawPoint = Omit<TeamPoint, NormalizedKeys> & { [K in NormalizedKeys]?: unknown };

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function count(value: unknown, min: number): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.round(value)) : null;
}

/** Tolerates older API answers (legacy kinds, fields of later stages missing) */
export function normalizePoint(raw: RawPoint): TeamPoint {
  const activities = toActivityCodes(raw.activities);
  const legacyText = typeof raw.activity === "string" ? raw.activity : "";
  const legacy = activityFromText(legacyText);
  const codes = activities.length || Array.isArray(raw.activities) ? activities : legacy ? [legacy] : [];
  const logoVersion = raw.hasLogo === true && typeof raw.logoVersion === "string" && raw.logoVersion !== "" ? raw.logoVersion : null;
  return {
    ...raw,
    kind: toPointKind(raw.kind),
    lastName: typeof raw.lastName === "string" ? raw.lastName : "",
    activity: legacyText,
    activities: codes,
    hasLogo: logoVersion !== null,
    logoVersion,
    isFavorite: raw.isFavorite === true,
    rank: count(raw.rank, 0) ?? 0,
    visibility: raw.visibility === "team" ? "team" : "public",
    description: text(raw.description),
    website: text(raw.website),
    parentId: text(raw.parentId),
    activitySlots: count(raw.activitySlots, 1) ?? Math.max(1, codes.length),
    emailVerified: raw.emailVerified === true,
    canEdit: raw.canEdit === true,
    // the team includes the owner
    memberCount: count(raw.memberCount, 1) ?? 1,
  };
}

export function pointTitle(p: Pick<TeamPoint, "firstName" | "lastName">): string {
  return [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || p.firstName;
}

/** RANK as shown: whole and never negative; `format` is the locale-aware number formatter (useFormatter().number) */
export function fmtRank(rank: number, format: (n: number) => string = (n) => n.toLocaleString("en-US")): string {
  return format(Math.max(0, Math.round(rank)));
}

/** 422 codes of /map-points calls the "points" dictionary words (errors.<field>.<code>) */
export const POINT_ERRORS: KnownFieldErrors = {
  activities: ["premiumRequired", "invalid"],
  logo: ["invalid", "tooLong"],
  points: ["limitReached"],
  balance: ["insufficient"],
  activitySlots: ["max"],
  email: ["missing", "alreadyVerified", "tooSoon", "mailUnavailable", "stale"],
  website: ["invalid", "tooLong"],
  description: ["tooLong"],
  parentId: ["invalid", "notFound"],
  visibility: ["invalid"],
};

export const TEAM_POINTS_KEY = "team-points";

const path = (id: string) => `/map-points/${encodeURIComponent(id)}`;

export const TeamPointsApi = {
  async list(): Promise<TeamPoint[]> {
    const { data } = await api.get<RawPoint[]>("/map-points");
    return data.map(normalizePoint);
  },
  async create(input: TeamPointInput): Promise<TeamPoint> {
    const { data } = await api.post<RawPoint>("/map-points", input);
    return normalizePoint(data);
  },
  async update(id: string, input: TeamPointInput): Promise<TeamPoint> {
    const { data } = await api.patch<RawPoint>(path(id), input);
    return normalizePoint(data);
  },
  async remove(id: string): Promise<void> {
    await api.delete(path(id));
  },
  async setFavorite(id: string, on: boolean): Promise<boolean> {
    const { data } = on
      ? await api.post<{ isFavorite?: boolean }>(`${path(id)}/favorite`)
      : await api.delete<{ isFavorite?: boolean }>(`${path(id)}/favorite`);
    return typeof data?.isFavorite === "boolean" ? data.isFavorite : on;
  },
  /** One more Business Activity slot, paid from the caller's balance */
  async buyActivitySlot(id: string): Promise<TeamPoint> {
    const { data } = await api.post<RawPoint>(`${path(id)}/activity-slots`);
    return normalizePoint(data);
  },
  async sendEmailVerification(id: string): Promise<void> {
    await api.post(`${path(id)}/email-verification`);
  },
  /** Team only: confirm the address by hand (mail not configured on the server) */
  async markEmailVerified(id: string): Promise<TeamPoint> {
    const { data } = await api.post<RawPoint>(`${path(id)}/email-verification/mark-verified`);
    return normalizePoint(data);
  },
  /** Public: the link from the confirmation email */
  async confirmEmail(token: string): Promise<{ pointId: string; title: string; email: string }> {
    const { data } = await api.post<{ pointId: string; title: string; email: string }>("/map-points/email-verification/confirm", { token });
    return data;
  },
};
