import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  APP_TIME_ZONE,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
} from "./config";
import { loadMessages } from "./messages";

/** No locale in the URL: the language lives in a cookie set by the switcher (and synced from the profile) */
export default getRequestConfig(async () => {
  const raw = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    locale,
    timeZone: APP_TIME_ZONE,
    messages: await loadMessages(locale),
  };
});
