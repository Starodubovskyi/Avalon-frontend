import type { AbstractIntlMessages } from "next-intl";
import { DEFAULT_LOCALE, type AppLocale } from "./config";

/** One file per namespace and locale, so each section owns its own dictionary */
export const NAMESPACES = [
  "common",
  "nav",
  "shell",
  "auth",
  "home",
  "publicPages",
  "map",
  "points",
  "companies",
  "profiles",
  "balance",
  "account",
  "verifyEmail",
  "dashboard",
  "vessels",
  "lineup",
  "requests",
  "chat",
  "social",
  "people",
  "documents",
  "tasks",
  "email",
  "ports",
  "activity",
  "team",
  "settings",
  "support",
  "demo",
  "network",
] as const;
export type Namespace = (typeof NAMESPACES)[number];

type Loader = () => Promise<{ default: AbstractIntlMessages }>;

const EN: Record<Namespace, Loader> = {
  common: () => import("../messages/en/common.json"),
  nav: () => import("../messages/en/nav.json"),
  shell: () => import("../messages/en/shell.json"),
  auth: () => import("../messages/en/auth.json"),
  home: () => import("../messages/en/home.json"),
  publicPages: () => import("../messages/en/publicPages.json"),
  map: () => import("../messages/en/map.json"),
  points: () => import("../messages/en/points.json"),
  companies: () => import("../messages/en/companies.json"),
  profiles: () => import("../messages/en/profiles.json"),
  balance: () => import("../messages/en/balance.json"),
  account: () => import("../messages/en/account.json"),
  verifyEmail: () => import("../messages/en/verifyEmail.json"),
  dashboard: () => import("../messages/en/dashboard.json"),
  vessels: () => import("../messages/en/vessels.json"),
  lineup: () => import("../messages/en/lineup.json"),
  requests: () => import("../messages/en/requests.json"),
  chat: () => import("../messages/en/chat.json"),
  social: () => import("../messages/en/social.json"),
  people: () => import("../messages/en/people.json"),
  documents: () => import("../messages/en/documents.json"),
  tasks: () => import("../messages/en/tasks.json"),
  email: () => import("../messages/en/email.json"),
  ports: () => import("../messages/en/ports.json"),
  activity: () => import("../messages/en/activity.json"),
  team: () => import("../messages/en/team.json"),
  settings: () => import("../messages/en/settings.json"),
  support: () => import("../messages/en/support.json"),
  demo: () => import("../messages/en/demo.json"),
  network: () => import("../messages/en/network.json"),
};
const RU: Record<Namespace, Loader> = {
  common: () => import("../messages/ru/common.json"),
  nav: () => import("../messages/ru/nav.json"),
  shell: () => import("../messages/ru/shell.json"),
  auth: () => import("../messages/ru/auth.json"),
  home: () => import("../messages/ru/home.json"),
  publicPages: () => import("../messages/ru/publicPages.json"),
  map: () => import("../messages/ru/map.json"),
  points: () => import("../messages/ru/points.json"),
  companies: () => import("../messages/ru/companies.json"),
  profiles: () => import("../messages/ru/profiles.json"),
  balance: () => import("../messages/ru/balance.json"),
  account: () => import("../messages/ru/account.json"),
  verifyEmail: () => import("../messages/ru/verifyEmail.json"),
  dashboard: () => import("../messages/ru/dashboard.json"),
  vessels: () => import("../messages/ru/vessels.json"),
  lineup: () => import("../messages/ru/lineup.json"),
  requests: () => import("../messages/ru/requests.json"),
  chat: () => import("../messages/ru/chat.json"),
  social: () => import("../messages/ru/social.json"),
  people: () => import("../messages/ru/people.json"),
  documents: () => import("../messages/ru/documents.json"),
  tasks: () => import("../messages/ru/tasks.json"),
  email: () => import("../messages/ru/email.json"),
  ports: () => import("../messages/ru/ports.json"),
  activity: () => import("../messages/ru/activity.json"),
  team: () => import("../messages/ru/team.json"),
  settings: () => import("../messages/ru/settings.json"),
  support: () => import("../messages/ru/support.json"),
  demo: () => import("../messages/ru/demo.json"),
  network: () => import("../messages/ru/network.json"),
};
const RO: Record<Namespace, Loader> = {
  common: () => import("../messages/ro/common.json"),
  nav: () => import("../messages/ro/nav.json"),
  shell: () => import("../messages/ro/shell.json"),
  auth: () => import("../messages/ro/auth.json"),
  home: () => import("../messages/ro/home.json"),
  publicPages: () => import("../messages/ro/publicPages.json"),
  map: () => import("../messages/ro/map.json"),
  points: () => import("../messages/ro/points.json"),
  companies: () => import("../messages/ro/companies.json"),
  profiles: () => import("../messages/ro/profiles.json"),
  balance: () => import("../messages/ro/balance.json"),
  account: () => import("../messages/ro/account.json"),
  verifyEmail: () => import("../messages/ro/verifyEmail.json"),
  dashboard: () => import("../messages/ro/dashboard.json"),
  vessels: () => import("../messages/ro/vessels.json"),
  lineup: () => import("../messages/ro/lineup.json"),
  requests: () => import("../messages/ro/requests.json"),
  chat: () => import("../messages/ro/chat.json"),
  social: () => import("../messages/ro/social.json"),
  people: () => import("../messages/ro/people.json"),
  documents: () => import("../messages/ro/documents.json"),
  tasks: () => import("../messages/ro/tasks.json"),
  email: () => import("../messages/ro/email.json"),
  ports: () => import("../messages/ro/ports.json"),
  activity: () => import("../messages/ro/activity.json"),
  team: () => import("../messages/ro/team.json"),
  settings: () => import("../messages/ro/settings.json"),
  support: () => import("../messages/ro/support.json"),
  demo: () => import("../messages/ro/demo.json"),
  network: () => import("../messages/ro/network.json"),
};

const LOADERS: Record<AppLocale, Record<Namespace, Loader>> = {
  en: EN,
  ru: RU,
  ro: RO,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Locale values over the English base: a key not translated yet shows in English instead of its path */
function mergeMessages(
  base: AbstractIntlMessages,
  over: AbstractIntlMessages,
): AbstractIntlMessages {
  const out: AbstractIntlMessages = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const prev = out[key];
    out[key] =
      isRecord(prev) && isRecord(value)
        ? mergeMessages(
            prev as AbstractIntlMessages,
            value as AbstractIntlMessages,
          )
        : value;
  }
  return out;
}

async function loadLocale(locale: AppLocale): Promise<AbstractIntlMessages> {
  const entries = await Promise.all(
    NAMESPACES.map(
      async (ns) => [ns, (await LOADERS[locale][ns]()).default] as const,
    ),
  );
  return Object.fromEntries(entries);
}

export async function loadMessages(
  locale: AppLocale,
): Promise<AbstractIntlMessages> {
  const base = await loadLocale(DEFAULT_LOCALE);
  return locale === DEFAULT_LOCALE
    ? base
    : mergeMessages(base, await loadLocale(locale));
}
