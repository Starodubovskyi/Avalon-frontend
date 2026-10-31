import { ROLE } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/domain/map-point";
import { fmtDate, fmtRelative } from "@/lib/vessels/format";
import type { Conversation, NetworkRole, UserCard } from "./api";

type Named = Pick<UserCard, "id" | "firstName" | "lastName" | "email">;

export function personName(u: Named | null | undefined): string {
  if (!u) return "Unknown";
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email || `User #${u.id}`;
}

export function firstName(u: Named | null | undefined): string {
  return u?.firstName?.trim() || personName(u).split(" ")[0];
}

const ROLE_BY_NAME: Record<NetworkRole, number> = {
  admin: ROLE.admin,
  staff: ROLE.staff,
  viewer: ROLE.viewer,
};

/** Contract role name → numeric role used by RoleBadge; anything unknown reads as viewer */
export function roleIdOf(role: string | null | undefined): number {
  return role && role in ROLE_BY_NAME ? ROLE_BY_NAME[role as NetworkRole] : ROLE.viewer;
}

function roleNameOf(user: AuthUser): NetworkRole {
  const id = user.role?.id;
  if (id === ROLE.admin) return "admin";
  if (id === ROLE.staff) return "staff";
  return "viewer";
}

export function toUserCard(user: AuthUser): UserCard {
  return {
    id: Number(user.id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: roleNameOf(user),
  };
}

export function sameUser(a: number | string | null | undefined, b: number | string | null | undefined): boolean {
  return a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b);
}

/** Members other than me (a direct chat with myself would leave just me) */
export function otherMembers(c: Conversation, meId: number | string | null | undefined): UserCard[] {
  const others = c.members.filter((m) => !sameUser(m.id, meId));
  return others.length ? others : c.members;
}

export function conversationTitle(c: Conversation, meId: number | string | null | undefined): string {
  if (c.kind === "group") return c.title?.trim() || otherMembers(c, meId).map(firstName).join(", ") || "Group";
  return personName(otherMembers(c, meId)[0]);
}

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

const CLOCK = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const DAY_LONG = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
const DAY_YEAR = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const FULL = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function daysAgo(d: Date, now: number): number {
  return Math.round((startOfDay(new Date(now)) - startOfDay(d)) / 86_400_000);
}

export function clockTime(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? CLOCK.format(d) : "";
}

export function fullTime(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? FULL.format(d) : "";
}

/** Compact stamp for the conversation list: 14:05 · Yesterday · Mon · 12 Oct */
export function listTime(iso: string | null | undefined, now = Date.now()): string {
  const d = parse(iso);
  if (!d) return "";
  const days = daysAgo(d, now);
  if (days <= 0) return CLOCK.format(d);
  if (days === 1) return "Yesterday";
  if (days < 7) return WEEKDAY.format(d);
  return fmtDate(iso);
}

/** Local calendar day id, used to place day separators */
export function dayKey(iso: string): string {
  const d = parse(iso);
  return d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : "unknown";
}

export function dayLabel(iso: string, now = Date.now()): string {
  const d = parse(iso);
  if (!d) return "";
  const days = daysAgo(d, now);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.getFullYear() === new Date(now).getFullYear() ? DAY_LONG.format(d) : DAY_YEAR.format(d);
}

/** Feed stamp: relative for a week, then the date */
export function feedTime(iso: string | null | undefined, now = Date.now()): string {
  const d = parse(iso);
  if (!d) return "";
  const age = now - d.getTime();
  // a server clock slightly ahead of the browser must not read as "in 1 min"
  if (age < 60_000) return "just now";
  return age < 7 * 86_400_000 ? fmtRelative(iso, now) : fmtDate(iso);
}

export function countLabel(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
