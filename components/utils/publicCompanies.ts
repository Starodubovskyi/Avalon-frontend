"use client";

import type { Company } from "@/components/types/company.types";
import type { AdminCompany } from "@/components/admin/companies/types";
import { adminCompaniesMock } from "@/components/admin/companies/mock";

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

  return {
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
