import type { UserCard } from "@/lib/network/api";
import type { RawPoint, TeamPoint } from "@/lib/points/team-points";

/** Company profile of a map point (backend /companies, docs/designs/2026-11-03-phase2-3-wallet-profiles-i18n.md) */

export type MapPointView = TeamPoint;
export type MemberStatus = "pending" | "active";
export type MemberRole = "owner" | "member";
export type MyMembership = "owner" | "active" | "pending" | null;

export interface CompanyMember {
  user: UserCard;
  position: string | null;
  role: MemberRole;
  status: MemberStatus;
  headline: string | null;
  rank: number;
  joinedAt: string;
}

export interface CompanyProfile {
  point: MapPointView;
  parent: MapPointView | null;
  branches: MapPointView[];
  /** Active members; pending ones only for the owner and the team */
  members: CompanyMember[];
  myMembership: MyMembership;
  canManage: boolean;
}

/** Wire shape before the points are normalized */
export interface RawCompanyProfile extends Omit<CompanyProfile, "point" | "parent" | "branches"> {
  point: RawPoint;
  parent: RawPoint | null;
  branches: RawPoint[];
}

/** company_member.position, backend limit */
export const POSITION_MAX = 120;
