import type { PersonCompany, PersonProfile } from "@/lib/profiles/types";
import { BIO_MAX, HEADLINE_MAX, PHONE_MAX } from "@/lib/profiles/types";
import { isLocale } from "@/i18n/config";
import { intParam, invalid, notFound, ok, requireUser, type DemoRequest, type RouteDef } from "../http";
import { canSeeUser, cardFor, findUser, isTeamUser, userRank } from "../presenters";
import { canSeePoint } from "../pointView";
import type { DemoState, DemoUserRow } from "../types";

/** /profiles — personal pages (stage 2): visible like People, phone only for the person and the team */

/** Owning means running the business; adding an authority or a person to the map is not ownership */
const OWNED = ["head_office", "branch", "self_employed", "for_sale"];
const OWNED_KINDS = new Set<string>(OWNED);
/** One can work at a harbour master office, but a private person's pin is never a workplace */
const MEMBER_KINDS = new Set<string>(OWNED.concat("authority"));

function companiesOf(state: DemoState, viewer: DemoUserRow, target: DemoUserRow): PersonCompany[] {
  const out: PersonCompany[] = [];
  for (const p of state.mapPoints) {
    if (p.deletedAt || !canSeePoint(viewer, p)) continue;
    const membership = state.companyMembers.find((m) => m.pointId === p.id && m.userId === target.id && m.status === "active");
    const owner = p.userId === target.id && OWNED_KINDS.has(p.kind);
    const member = !!membership && MEMBER_KINDS.has(p.kind);
    if (!owner && !member) continue;
    out.push({
      pointId: p.id,
      title: p.firstName,
      kind: p.kind,
      role: owner ? "owner" : "member",
      position: membership?.position ?? null,
      hasLogo: !!p.logo,
      logoVersion: p.logo ? p.logoVersion : null,
    });
  }
  return out.sort((a, b) => (a.role === b.role ? a.title.localeCompare(b.title) : a.role === "owner" ? -1 : 1));
}

function profileOf(state: DemoState, viewer: DemoUserRow, target: DemoUserRow): PersonProfile {
  const isMe = viewer.id === target.id;
  const follows = state.follows;
  return {
    user: cardFor(viewer, target),
    headline: target.headline,
    bio: target.bio,
    phone: isMe || isTeamUser(viewer) ? target.phone : null,
    locale: target.locale,
    rank: userRank(state, target.id),
    companies: companiesOf(state, viewer, target),
    stats: {
      points: state.mapPoints.filter((p) => !p.deletedAt && p.userId === target.id && canSeePoint(viewer, p)).length,
      posts: state.posts.filter((p) => p.authorId === target.id && !p.deletedAt).length,
      followers: follows.filter((f) => f.followeeId === target.id).length,
      following: follows.filter((f) => f.followerId === target.id).length,
    },
    isFollowing: follows.some((f) => f.followerId === viewer.id && f.followeeId === target.id),
    canMessage: !isMe,
    isMe,
    memberSince: target.createdAt,
  };
}

function getProfile(req: DemoRequest) {
  const viewer = requireUser(req);
  const target = findUser(req.state, intParam(req, "userId"));
  if (!target || target.deletedAt || !canSeeUser(req.state, viewer, target)) notFound("Profile not found");
  return ok(profileOf(req.state, viewer, target));
}

/** Optional text: undefined keeps, "" / null clears, longer than max → tooLong */
function optionalText(value: unknown, field: string, max: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return invalid({ [field]: "invalid" });
  const text = value.trim();
  if (text.length > max) invalid({ [field]: "tooLong" });
  return text || null;
}

function updateMe(req: DemoRequest) {
  const user = requireUser(req);
  const headline = optionalText(req.body.headline, "headline", HEADLINE_MAX);
  const bio = optionalText(req.body.bio, "bio", BIO_MAX);
  const phone = optionalText(req.body.phone, "phone", PHONE_MAX);
  if (phone && !/^[+\d][\d\s().-]{3,}$/.test(phone)) invalid({ phone: "invalid" });
  const locale = req.body.locale;
  if (locale !== undefined && !isLocale(locale)) invalid({ locale: "invalid" });
  if (headline !== undefined) user.headline = headline;
  if (bio !== undefined) user.bio = bio;
  if (phone !== undefined) user.phone = phone;
  if (isLocale(locale)) user.locale = locale;
  user.updatedAt = new Date().toISOString();
  return ok(profileOf(req.state, user, user));
}

export const profileRoutes: RouteDef[] = [
  ["PATCH", "/profiles/me", updateMe],
  ["GET", "/profiles/:userId", getProfile],
];
