import type { DemoRole } from "../mode";
import type { AppLocale } from "@/i18n/config";
import type { DemoUserRow, RoleIdValue } from "../types";

/** Invented team: ids start at 701 so they never collide with real accounts' local caches */
export const DEMO_ACCOUNTS: Record<DemoRole, number> = {
  admin: 701,
  staff: 702,
  viewer: 705,
};

export const DEMO_USER_IDS = [701, 702, 703, 704, 705, 706, 707, 708] as const;

interface UserSpec {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: RoleIdValue;
  daysAgo: number;
  headline: string;
  bio: string;
  phone: string;
  locale: AppLocale;
}

const USERS: UserSpec[] = [
  {
    id: 701, firstName: "Irina", lastName: "Moraru", email: "irina.moraru@avalon-demo.example", roleId: 1, daysAgo: 410,
    headline: "Managing director, Avalon Shipping", phone: "+40 744 000 701", locale: "en",
    bio: "Twenty years on the Lower Danube. I run Avalon's agency network from Sulina to Reni and look after owners who call the river ports for the first time.",
  },
  {
    id: 702, firstName: "Andrei", lastName: "Lungu", email: "andrei.lungu@avalon-demo.example", roleId: 3, daysAgo: 380,
    headline: "Sulina roads · pilots, tugs, formalities", phone: "+40 721 000 702", locale: "en",
    bio: "Boarding formalities, pilots and tugs at the Sulina roads. Reachable 24/7 on WhatsApp.",
  },
  {
    id: 703, firstName: "Olena", lastName: "Kravets", email: "olena.kravets@avalon-demo.example", roleId: 3, daysAgo: 300,
    headline: "Line-ups and cargo docs · Izmail & Reni", phone: "+380 67 000 7030", locale: "en",
    bio: "Grain and fertilizer calls at Izmail and Reni: line-ups, surveyors and cargo documents.",
  },
  {
    id: 704, firstName: "Mihai", lastName: "Dobre", email: "mihai.dobre@avalon-demo.example", roleId: 3, daysAgo: 190,
    headline: "Crew changes and supplies · Galați", phone: "+40 722 000 704", locale: "en",
    bio: "Crew changes, spares and supplies for vessels calling Galați and Brăila.",
  },
  {
    id: 705, firstName: "Sofia", lastName: "Petrenko", email: "sofia.petrenko@danube-grain.example", roleId: 2, daysAgo: 64,
    headline: "Chartering manager, Danube Grain Trading", phone: "+40 723 000 705", locale: "en",
    bio: "I charter handysize and river-sea tonnage for grain out of Galați, Reni and Constanța.",
  },
  {
    id: 706, firstName: "Daniel", lastName: "Novak", email: "d.novak@pontic-chartering.example", roleId: 2, daysAgo: 23,
    headline: "Chartering broker, Pontic Chartering", phone: "+359 88 000 7060", locale: "en",
    bio: "Black Sea and Danube cargo broking, mostly agri and steel.",
  },
  {
    id: 707, firstName: "Kerem", lastName: "Aksoy", email: "kerem.aksoy@marmara-tankers.example", roleId: 2, daysAgo: 12,
    headline: "Operations director, Marmara Tankers", phone: "+90 532 000 7070", locale: "en",
    bio: "Product tankers between the Marmara Sea, Constanța and the Giurgiulești terminal.",
  },
  {
    id: 708, firstName: "Anna", lastName: "Lindqvist", email: "anna.lindqvist@nordbulk.example", roleId: 2, daysAgo: 6,
    headline: "Grain logistics · ex-Nordbulk", phone: "+46 70 000 7080", locale: "en",
    bio: "Moving to grain logistics on the Danube after ten years in Baltic dry bulk.",
  },
];

export function seedUsers(now: number): DemoUserRow[] {
  return USERS.map((u) => {
    const at = new Date(now - u.daysAgo * 86_400_000).toISOString();
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roleId: u.roleId,
      statusId: 1,
      headline: u.headline,
      bio: u.bio,
      phone: u.phone,
      locale: u.locale,
      createdAt: at,
      updatedAt: at,
      deletedAt: null,
    };
  });
}

/** Staff who edit the board in the seeded history */
export const EDITORS = [702, 703, 704, 701] as const;
