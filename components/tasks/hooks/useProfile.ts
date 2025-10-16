"use client";

import { useEffect } from "react";
import useSWR from "swr";
import api, { ensureAccessToken } from "@/lib/api/client";
import type { ProfileResponseDto } from "@/lib/api/profile";

async function fetcher(): Promise<ProfileResponseDto> {
  await ensureAccessToken();
  const { data } = await api.get<ProfileResponseDto>("/me/profile", {
    withCredentials: true,
  });
  return data;
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR("profile/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    revalidateIfStale: true,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    const onAuth = () => mutate();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "auth:ts") mutate();
    };
    window.addEventListener("authchange", onAuth);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("authchange", onAuth);
      window.removeEventListener("storage", onStorage);
    };
  }, [mutate]);

  const user = data?.user;
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user?.email ?? "").split("@")[0] ||
    "User";

  return {
    profile: data,
    user,
    isLoading,
    error,
    refresh: () => mutate(),
    name: displayName,
    email: user?.email ?? "",
    photoUrl: user?.photoUrl ?? null,
    isAuthenticated: Boolean(user?.id || user?.email),
  };
}
