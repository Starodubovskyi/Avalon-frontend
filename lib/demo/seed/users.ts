import type { DemoRole } from "../mode";
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
}

const USERS: UserSpec[] = [
  { id: 701, firstName: "Irina", lastName: "Moraru", email: "irina.moraru@avalon-demo.example", roleId: 1, daysAgo: 410 },
  { id: 702, firstName: "Andrei", lastName: "Lungu", email: "andrei.lungu@avalon-demo.example", roleId: 3, daysAgo: 380 },
  { id: 703, firstName: "Olena", lastName: "Kravets", email: "olena.kravets@avalon-demo.example", roleId: 3, daysAgo: 300 },
  { id: 704, firstName: "Mihai", lastName: "Dobre", email: "mihai.dobre@avalon-demo.example", roleId: 3, daysAgo: 190 },
  { id: 705, firstName: "Sofia", lastName: "Petrenko", email: "sofia.petrenko@danube-grain.example", roleId: 2, daysAgo: 64 },
  { id: 706, firstName: "Daniel", lastName: "Novak", email: "d.novak@pontic-chartering.example", roleId: 2, daysAgo: 23 },
  { id: 707, firstName: "Kerem", lastName: "Aksoy", email: "kerem.aksoy@marmara-tankers.example", roleId: 2, daysAgo: 12 },
  { id: 708, firstName: "Anna", lastName: "Lindqvist", email: "anna.lindqvist@nordbulk.example", roleId: 2, daysAgo: 6 },
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
      createdAt: at,
      updatedAt: at,
      deletedAt: null,
    };
  });
}

/** Staff who edit the board in the seeded history */
export const EDITORS = [702, 703, 704, 701] as const;
