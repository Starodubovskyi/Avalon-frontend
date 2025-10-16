"use client";
import api, { ensureAccessToken } from "./client";

export type ProfileUserDto = {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: string;
};

export type ProfileMembershipDto = {
  plan: string | null;
  billing: "monthly" | "yearly" | null;
  startedAt: string | null;
  expiresAt: string | null;
  effective: string;
};

export type ProfileStatsDto = {
  portsTotal: number;
  portsOpen: number;
  portsCongested: number;
  portsClosed: number;
};

export type ProfileResponseDto = {
  user: ProfileUserDto;
  membership: ProfileMembershipDto;
  stats: ProfileStatsDto;
};

export type UpdateProfileDto = {
  firstName?: string | null;
  lastName?: string | null;
  photoId?: number | null;
};

function normalizePlan(raw: any): "Basic" | "Pro" | "Business" | null {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.includes("pro")) return "Pro";
  if (s.includes("business") || s.includes("biz")) return "Business";
  if (s.includes("basic") || s.includes("free")) return "Basic";
  return null;
}
function normalizeBilling(raw: any): "monthly" | "yearly" | null {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.startsWith("year")) return "yearly";
  if (s.startsWith("month")) return "monthly";
  return null;
}

export async function getMyProfile(): Promise<ProfileResponseDto> {
  await ensureAccessToken();

  const { data: me } = await api.get<any>("/auth/me");
  const photoUrl = me?.photoUrl ?? me?.photo?.url ?? me?.photo?.path ?? null;

  const profile: ProfileResponseDto = {
    user: {
      id: me.id,
      email: me.email ?? null,
      firstName: me.firstName ?? null,
      lastName: me.lastName ?? null,
      photoUrl,
      createdAt: me.createdAt ?? new Date().toISOString(),
    },
    membership: {
      plan: "Basic",
      billing: null,
      startedAt: null,
      expiresAt: null,
      effective: "BASIC",
    },
    stats: { portsTotal: 0, portsOpen: 0, portsCongested: 0, portsClosed: 0 },
  };

  try {
    const { data: sub } = await api.get<any>("/users/me/subscription");
    const rawPlan = sub?.plan?.name ?? sub?.plan ?? sub?.planId ?? null;
    const plan = normalizePlan(rawPlan) ?? profile.membership.plan;
    const billing = normalizeBilling(sub?.billing);
    profile.membership = {
      plan,
      billing: billing ?? profile.membership.billing,
      startedAt: sub?.startedAt ?? null,
      expiresAt: sub?.expiresAt ?? null,
      effective: sub?.status ?? "PAID",
    };
  } catch {}

  return profile;
}

export async function updateMyProfile(dto: UpdateProfileDto): Promise<void> {
  await ensureAccessToken();
  await api.patch("/auth/me", dto);
}

export const ProfileApi = { getMyProfile, updateMyProfile };
