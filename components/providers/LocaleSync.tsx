"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import api from "@/lib/api/client";
import { useAuth } from "@/lib/auth/useAuth";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config";
import { writeLocaleCookie } from "@/lib/i18n/useAppLocale";

function hasLocaleCookie(): boolean {
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${LOCALE_COOKIE}=`));
}

/**
 * Once per signed-in user, reconcile the browser language with the profile:
 * - a language picked in this browser (cookie set, e.g. on the sign-in page) wins and is saved to the profile,
 *   so a fresh account (profile default "en") never flips a Russian or Romanian visitor back to English;
 * - with no choice in this browser yet, the language saved in the profile is adopted.
 * A later switch in this session is saved in the background and never flipped back by a stale profile.
 */
export function LocaleSync() {
  const { user } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const syncedFor = useRef<string | number | null>(null);

  useEffect(() => {
    if (!user || syncedFor.current === user.id) return;
    syncedFor.current = user.id;
    const saved = isLocale(user.locale) ? user.locale : null;
    if (saved === locale) return;
    if (hasLocaleCookie() || !saved) {
      api.patch("/profiles/me", { locale }).catch(() => undefined);
      return;
    }
    writeLocaleCookie(saved);
    router.refresh();
  }, [user, locale, router]);

  return null;
}
