import api from "@/lib/api/client";
import type { KnownFieldErrors } from "@/lib/api/fieldErrors";
import { normalizePoint, type RawPoint, type TeamPoint } from "@/lib/points/team-points";
import type { CompanyMember, CompanyProfile, MemberStatus, RawCompanyProfile } from "./types";

const base = (pointId: string) => `/companies/${encodeURIComponent(pointId)}`;

function toProfile(raw: RawCompanyProfile): CompanyProfile {
  return {
    ...raw,
    point: normalizePoint(raw.point),
    parent: raw.parent ? normalizePoint(raw.parent) : null,
    branches: raw.branches.map(normalizePoint),
  };
}

/** 422 codes of /companies calls the "companies" dictionary words */
export const COMPANY_ERRORS: KnownFieldErrors = {
  membership: ["exists", "owner"],
  position: ["tooLong"],
  status: ["invalid"],
};

export const CompaniesApi = {
  async get(pointId: string): Promise<CompanyProfile> {
    const { data } = await api.get<RawCompanyProfile>(base(pointId));
    return toProfile(data);
  },
  /** My points and the companies where I am an active member */
  async mine(): Promise<TeamPoint[]> {
    const { data } = await api.get<RawPoint[]>("/companies/mine");
    return data.map(normalizePoint);
  },
  async join(pointId: string, position: string | null): Promise<CompanyProfile> {
    const { data } = await api.post<RawCompanyProfile>(`${base(pointId)}/join`, position ? { position } : {});
    return toProfile(data);
  },
  async leave(pointId: string): Promise<void> {
    await api.delete(`${base(pointId)}/members/me`);
  },
  async updateMember(pointId: string, userId: number, patch: { status?: MemberStatus; position?: string | null }): Promise<CompanyMember> {
    const { data } = await api.patch<CompanyMember>(`${base(pointId)}/members/${userId}`, patch);
    return data;
  },
  async removeMember(pointId: string, userId: number): Promise<void> {
    await api.delete(`${base(pointId)}/members/${userId}`);
  },
};
