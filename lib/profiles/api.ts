import api from "@/lib/api/client";
import type { KnownFieldErrors } from "@/lib/api/fieldErrors";
import type { PersonProfile, ProfileInput } from "./types";

/** 422 codes of /profiles calls the "profiles" dictionary words */
export const PROFILE_ERRORS: KnownFieldErrors = {
  headline: ["tooLong", "invalid"],
  bio: ["tooLong", "invalid"],
  phone: ["tooLong", "invalid"],
  locale: ["invalid"],
};

export const ProfilesApi = {
  async get(userId: number): Promise<PersonProfile> {
    const { data } = await api.get<PersonProfile>(`/profiles/${userId}`);
    return data;
  },
  async updateMe(input: ProfileInput): Promise<PersonProfile> {
    const { data } = await api.patch<PersonProfile>("/profiles/me", input);
    return data;
  },
};
