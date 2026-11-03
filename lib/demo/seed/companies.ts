import type { CompanyMemberRow, MapPointRow } from "../types";

/** "I work here" memberships: Avalon's team in its offices, plus pending requests to approve in the demo */

type MemberSpec = [pointTitle: string, userId: number, position: string | null, status: CompanyMemberRow["status"], daysAgo: number];

const MEMBERS: MemberSpec[] = [
  ["Avalon Shipping SRL", 702, "Port agent", "active", 360],
  ["Avalon Shipping SRL", 703, "Operations manager", "active", 290],
  ["Avalon Shipping SRL", 704, "Husbandry agent", "active", 180],
  ["Avalon Shipping SRL", 706, "Freight broker", "pending", 1],
  ["Avalon Shipping — Izmail", 703, "Branch manager", "active", 280],
  ["Danube Grain Trading SRL", 708, "Logistics coordinator", "pending", 2],
];

export function seedCompanyMembers(points: MapPointRow[], now: number): CompanyMemberRow[] {
  return MEMBERS.flatMap(([title, userId, position, status, daysAgo]) => {
    const point = points.find((p) => p.firstName === title);
    return point ? [{ pointId: point.id, userId, position, status, createdAt: new Date(now - daysAgo * 86_400_000).toISOString() }] : [];
  });
}
