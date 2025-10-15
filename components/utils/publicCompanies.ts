"use client";

import type { Company } from "@/components/types/company.types";
import type { AdminCompany } from "@/components/admin/companies/types";
import { adminCompaniesMock } from "@/components/admin/companies/mock";

type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileUrl?: string;
  avatarUrl?: string;
  isDeputy?: boolean;
};
type LineUpItem = {
  id: string;
  port: string;
  window?: string;
  notes?: string;
};

const av = (u: string) =>
  `https://i.pravatar.cc/128?u=${encodeURIComponent(u)}`;

const profileExtraById: Record<
  string,
  Partial<
    Pick<
      Company,
      | "bannerUrl"
      | "description"
      | "website"
      | "email"
      | "founded"
      | "employees"
      | "servicedPorts"
      | "legalName"
      | "tagline"
      | "lat"
      | "lng"
    >
  >
> = {
  "1": {
    description:
      "Leading ship supplier in the region providing provisions, technical stores and logistics.",
    website: "https://avs.example.com",
    email: "hello@avs.example.com",
    founded: "1998",
    employees: 250,
    servicedPorts: "Istanbul, Izmit",
    tagline: "Trusted ship supply",
    lat: 41.0082,
    lng: 28.9784,
  },
  "2": {
    description:
      "Global shipchandler known for speed, quality and wide assortment.",
    website: "https://sevenseas.example.com",
    email: "ops@sevenseas.example.com",
    founded: "2002",
    employees: 180,
    lat: 25.2048,
    lng: 55.2708,
  },
  "3": {
    description:
      "Ukrainian agency offering full port agency and husbandry services.",
    website: "https://starkshipping.example.com",
    email: "info@stark.ua",
    founded: "2010",
    employees: 60,
    lat: 46.4825,
    lng: 30.7233,
  },
  "4": {
    description:
      "One of the world’s largest maritime networks providing agency & marine products.",
    website: "https://wilhelmsen.example.com",
    email: "contact@wilhelmsen.com",
    founded: "1861",
    employees: 21000,
    lat: 59.9139,
    lng: 10.7522,
  },
  "5": {
    description:
      "Global agency with strong presence in the Middle East and Indian Subcontinent.",
    website: "https://gac.example.com",
    email: "hq@gac.com",
    founded: "1956",
    employees: 10000,
    lat: 26.2235,
    lng: 50.5876,
  },
  "6": {
    description:
      "Integrated logistics provider focused on Black Sea operations and project cargo.",
    website: "https://mlc.example.com",
    email: "ops@mlc.ro",
    founded: "2007",
    employees: 120,
    lat: 44.1598,
    lng: 28.6348,
  },
  "7": {
    description:
      "Ship repair yard providing afloat and alongside repairs with fast response.",
    website: "https://balticmarine.example.com",
    email: "service@balticmarine.lv",
    lat: 56.9496,
    lng: 24.1052,
  },
  "8": {
    description:
      "Crew management company with Eastern Europe sourcing and global placements.",
    website: "https://blackseacrew.example.com",
    email: "hr@bsc.ro",
    lat: 44.4268,
    lng: 26.1025,
  },
  "9": {
    description:
      "Port services and terminal assistance across the Marmara region.",
    website: "https://psi.example.com",
    email: "ops@psi.tr",
    lat: 41.0082,
    lng: 28.9784,
  },
  "10": {
    description: "Marine environmental response and waste management services.",
    website: "https://greenanchor.example.com",
    email: "info@greenanchor.gr",
    tagline: "Safer seas together",
    lat: 37.942,
    lng: 23.646,
  },
};

const teamById: Record<string, TeamMember[]> = {
  "1": [
    {
      id: "tm-1-1",
      firstName: "Elena",
      lastName: "Popescu",
      role: "Operations Manager",
      profileUrl: "https://avalon.app/u/elena.popescu",
      avatarUrl: av("elena.popescu"),
      isDeputy: true,
    },
    {
      id: "tm-1-2",
      firstName: "Andrei",
      lastName: "Ionescu",
      role: "Port Agent",
      profileUrl: "https://avalon.app/u/andrei.ionescu",
      avatarUrl: av("andrei.ionescu"),
    },
    {
      id: "tm-1-3",
      firstName: "Sofia",
      lastName: "Radu",
      role: "Logistics Coordinator",
      profileUrl: "https://avalon.app/u/sofia.radu",
      avatarUrl: av("sofia.radu"),
    },
  ],
  "2": [
    {
      id: "tm-2-1",
      firstName: "Mariya",
      lastName: "Kozlova",
      role: "Chartering Specialist",
      profileUrl: "https://avalon.app/u/mariya.kozlova",
      avatarUrl: av("mariya.kozlova"),
      isDeputy: true,
    },
    {
      id: "tm-2-2",
      firstName: "Ivan",
      lastName: "Petrov",
      role: "HSE Officer",
      profileUrl: "https://avalon.app/u/ivan.petrov",
      avatarUrl: av("ivan.petrov"),
    },
  ],
  "3": [
    {
      id: "tm-3-1",
      firstName: "George",
      lastName: "Marin",
      role: "Fleet Supervisor",
      profileUrl: "https://avalon.app/u/george.marin",
      avatarUrl: av("george.marin"),
    },
    {
      id: "tm-3-2",
      firstName: "Daria",
      lastName: "Munteanu",
      role: "Crew Manager",
      profileUrl: "https://avalon.app/u/daria.munteanu",
      avatarUrl: av("daria.munteanu"),
      isDeputy: true,
    },
  ],
  "4": [
    {
      id: "tm-4-1",
      firstName: "Catalin",
      lastName: "Stoica",
      role: "Technical Superintendent",
      profileUrl: "https://avalon.app/u/catalin.stoica",
      avatarUrl: av("catalin.stoica"),
      isDeputy: true,
    },
    {
      id: "tm-4-2",
      firstName: "Ivan",
      lastName: "Petrov",
      role: "HSE Officer",
      profileUrl: "https://avalon.app/u/ivan.petrov",
      avatarUrl: av("ivan.petrov"),
    },
  ],
  "5": [
    {
      id: "tm-5-1",
      firstName: "Elena",
      lastName: "Popescu",
      role: "Regional Manager",
      profileUrl: "https://avalon.app/u/elena.popescu",
      avatarUrl: av("elena.popescu"),
      isDeputy: true,
    },
    {
      id: "tm-5-2",
      firstName: "Andrei",
      lastName: "Ionescu",
      role: "Port Agent",
      profileUrl: "https://avalon.app/u/andrei.ionescu",
      avatarUrl: av("andrei.ionescu"),
    },
  ],
  "6": [
    {
      id: "tm-6-1",
      firstName: "Renat",
      lastName: "Brynza",
      role: "Crew Manager",
      profileUrl: "https://avalon.app/u/renat.brynza",
      avatarUrl: av("renat.brynza"),
      isDeputy: true,
    },
    {
      id: "tm-6-2",
      firstName: "Sofia",
      lastName: "Radu",
      role: "Logistics Coordinator",
      profileUrl: "https://avalon.app/u/sofia.radu",
      avatarUrl: av("sofia.radu"),
    },
  ],
  "7": [
    {
      id: "tm-7-1",
      firstName: "Bogdan",
      lastName: "Rumu",
      role: "Workshop Lead",
      profileUrl: "https://avalon.app/u/bogdan.rumu",
      avatarUrl: av("bogdan.rumu"),
      isDeputy: true,
    },
    {
      id: "tm-7-2",
      firstName: "George",
      lastName: "Marin",
      role: "Fleet Supervisor",
      profileUrl: "https://avalon.app/u/george.marin",
      avatarUrl: av("george.marin"),
    },
  ],
  "8": [
    {
      id: "tm-8-1",
      firstName: "Daria",
      lastName: "Munteanu",
      role: "HR Lead",
      profileUrl: "https://avalon.app/u/daria.munteanu",
      avatarUrl: av("daria.munteanu"),
      isDeputy: true,
    },
    {
      id: "tm-8-2",
      firstName: "Mariya",
      lastName: "Kozlova",
      role: "Recruitment",
      profileUrl: "https://avalon.app/u/mariya.kozlova",
      avatarUrl: av("mariya.kozlova"),
    },
  ],
  "9": [
    {
      id: "tm-9-1",
      firstName: "Andrei",
      lastName: "Ionescu",
      role: "Port Agent",
      profileUrl: "https://avalon.app/u/andrei.ionescu",
      avatarUrl: av("andrei.ionescu"),
      isDeputy: true,
    },
    {
      id: "tm-9-2",
      firstName: "Elena",
      lastName: "Popescu",
      role: "Ops Coordinator",
      profileUrl: "https://avalon.app/u/elena.popescu",
      avatarUrl: av("elena.popescu"),
    },
  ],
  "10": [
    {
      id: "tm-10-1",
      firstName: "Ivan",
      lastName: "Petrov",
      role: "HSE Officer",
      profileUrl: "https://avalon.app/u/ivan.petrov",
      avatarUrl: av("ivan.petrov"),
      isDeputy: true,
    },
    {
      id: "tm-10-2",
      firstName: "Catalin",
      lastName: "Stoica",
      role: "Technical Superintendent",
      profileUrl: "https://avalon.app/u/catalin.stoica",
      avatarUrl: av("catalin.stoica"),
    },
  ],
};

const lineupById: Record<string, LineUpItem[]> = {
  "1": [
    {
      id: "lu-1-1",
      port: "Istanbul",
      window: "Sep 20–22",
      notes: "Stores & provisions",
    },
    { id: "lu-1-2", port: "Izmit", window: "Sep 25–27" },
  ],
  "2": [
    {
      id: "lu-2-1",
      port: "Jebel Ali",
      window: "Sep 18–19",
      notes: "Urgent chandlery",
    },
    { id: "lu-2-2", port: "Dubai", window: "Sep 24–25" },
  ],
  "3": [
    { id: "lu-3-1", port: "Odessa", window: "Sep 21–23", notes: "Husbandry" },
    { id: "lu-3-2", port: "Chornomorsk", window: "Sep 28–30" },
  ],
  "4": [
    { id: "lu-4-1", port: "Oslo", window: "Sep 19–21" },
    {
      id: "lu-4-2",
      port: "Bergen",
      window: "Sep 26–27",
      notes: "Marine products",
    },
  ],
  "5": [
    { id: "lu-5-1", port: "Dammam", window: "Sep 20–22" },
    { id: "lu-5-2", port: "Jubail", window: "Sep 25–26", notes: "Agency call" },
  ],
  "6": [
    {
      id: "lu-6-1",
      port: "Constanța",
      window: "Sep 18–20",
      notes: "Project cargo",
    },
    { id: "lu-6-2", port: "Mangalia", window: "Sep 23–24" },
  ],
  "7": [
    { id: "lu-7-1", port: "Riga", window: "Sep 22–23", notes: "Afloat repair" },
    { id: "lu-7-2", port: "Ventspils", window: "Sep 29–30" },
  ],
  "8": [
    {
      id: "lu-8-1",
      port: "Bucharest (HQ)",
      window: "Sep",
      notes: "Interviews",
    },
    {
      id: "lu-8-2",
      port: "Constanța",
      window: "Oct 1–3",
      notes: "Crew change",
    },
  ],
  "9": [
    { id: "lu-9-1", port: "Gemlik", window: "Sep 19–20" },
    {
      id: "lu-9-2",
      port: "Bandırma",
      window: "Sep 26–27",
      notes: "Terminal assistance",
    },
  ],
  "10": [
    {
      id: "lu-10-1",
      port: "Piraeus",
      window: "Sep 21–22",
      notes: "Response drill",
    },
    { id: "lu-10-2", port: "Elefsina", window: "Sep 27–28" },
  ],
};

const LS_KEY = "admin:companies";

function readAdminCompanies(): AdminCompany[] {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    const fromLS: AdminCompany[] = raw ? JSON.parse(raw) : [];
    const base = adminCompaniesMock;

    const map = new Map<string, AdminCompany>();
    base.forEach((c) => map.set(c.id, c));
    fromLS.forEach((c) => map.set(c.id, c));

    return Array.from(map.values());
  } catch {
    return adminCompaniesMock;
  }
}

export function adminToPublic(c: AdminCompany): Company {
  const extra = profileExtraById[c.id] || {};

  const company: Company = {
    id: c.id,
    businessName: c.name,
    legalName: extra.legalName,
    activity: c.category,
    tagline: extra.tagline,
    bannerUrl: extra.bannerUrl,
    logoUrl: c.logoUrl,
    description: extra.description,
    website: extra.website,
    email: extra.email,
    founded: extra.founded,
    employees: extra.employees,
    servicedPorts: extra.servicedPorts,
    country: c.country,
    city: c.city,
    address: undefined,
    lat: extra.lat ?? 0,
    lng: extra.lng ?? 0,
    category: c.category,
    status: c.status,
  };

  const withExtras = company as any;
  withExtras.team = teamById[c.id] ?? [];
  withExtras.lineup = lineupById[c.id] ?? [];
  return withExtras as Company;
}

export function getPublicCompanies(): Company[] {
  return readAdminCompanies()
    .filter((c) => c.status !== "archived")
    .map(adminToPublic);
}

export function getPublicCompanyById(id: string): Company | null {
  const admin = readAdminCompanies().find((c) => c.id === id);
  return admin ? adminToPublic(admin) : null;
}

export const getCompanies = getPublicCompanies;
