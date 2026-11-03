import type { AppLocale } from "@/i18n/config";
import type { UserCard } from "@/lib/network/api";
import type { PointKind } from "@/lib/points/team-points";

/** Personal page of a user (backend /profiles, docs/designs/2026-11-03-phase2-3-wallet-profiles-i18n.md) */

export interface PersonCompany {
  pointId: string;
  title: string;
  kind: PointKind;
  role: "owner" | "member";
  position: string | null;
  hasLogo: boolean;
  logoVersion: string | null;
}

export interface PersonProfile {
  user: UserCard;
  headline: string | null;
  bio: string | null;
  /** Only for the person and the team */
  phone: string | null;
  locale: AppLocale;
  rank: number;
  companies: PersonCompany[];
  stats: { points: number; posts: number; followers: number; following: number };
  isFollowing: boolean;
  canMessage: boolean;
  isMe: boolean;
  memberSince: string;
}

export interface ProfileInput {
  headline?: string | null;
  bio?: string | null;
  phone?: string | null;
  locale?: AppLocale;
}

/** user.headline / bio / phone, backend limits */
export const HEADLINE_MAX = 120;
export const BIO_MAX = 1000;
export const PHONE_MAX = 40;
