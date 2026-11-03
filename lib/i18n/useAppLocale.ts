"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import api, { getAccessToken } from "@/lib/api/client";
import { LOCALE_COOKIE, isLocale, type AppLocale } from "@/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function writeLocaleCookie(locale: AppLocale) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
}

/**
 * Current interface language and a setter. Switching writes the cookie, re-renders the server tree
 * with the new dictionary (no full reload) and, when signed in, saves the choice to the profile.
 */
export function useAppLocale() {
  const current = useLocale();
  const locale: AppLocale = isLocale(current) ? current : "en";
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: AppLocale, { persist = true }: { persist?: boolean } = {}) => {
      writeLocaleCookie(next);
      startTransition(() => router.refresh());
      if (persist && getAccessToken()) {
        api.patch("/profiles/me", { locale: next }).catch(() => undefined);
      }
    },
    [router],
  );

  return { locale, setLocale, pending };
}
