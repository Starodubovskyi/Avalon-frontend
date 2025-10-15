// /lib/api/company.ts
"use client";

import api from "@/lib/api/client";

type Company = {
  businessName?: string;
  name?: string;
  logoUrl?: string;
  logo?: string;
  activity?: string;
  [key: string]: any;
};

async function getFirst<T = any>(paths: string[]) {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      const res = await api.get<T>(p);
      return res.data as any;
    } catch (e: any) {
      if (e?.response?.status !== 404) throw e;
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`No matching endpoint among: ${paths.join(", ")}`);
}

const MINE_CANDIDATES = [
  "/business-profile/me",
  "/business-profile",
  "/company/me",
  "/company",
];

export const CompanyApi = {
  async getMine(): Promise<Company | null> {
    try {
      const data = await getFirst<Company>(MINE_CANDIDATES);
      return data ?? null;
    } catch {
      return null;
    }
  },
};
