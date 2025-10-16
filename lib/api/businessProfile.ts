"use client";
import api from "@/lib/api/client";

export type BusinessProfileDto = {
  id: string;
  ownerId: string;
  businessName: string | null;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  tagline: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateBusinessProfileDto = Partial<
  Pick<
    BusinessProfileDto,
    | "businessName"
    | "legalName"
    | "email"
    | "phone"
    | "website"
    | "address"
    | "city"
    | "state"
    | "country"
    | "postalCode"
    | "tagline"
  >
>;

export async function getBusinessProfile(): Promise<BusinessProfileDto | null> {
  try {
    const { data } = await api.get("/business-profile");
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function createBusinessProfile(
  dto: UpdateBusinessProfileDto
): Promise<BusinessProfileDto> {
  const { data } = await api.post("/business-profile", dto);
  return data;
}

export async function updateBusinessProfile(
  dto: UpdateBusinessProfileDto
): Promise<BusinessProfileDto> {
  const { data } = await api.patch("/business-profile", dto);
  return data;
}
