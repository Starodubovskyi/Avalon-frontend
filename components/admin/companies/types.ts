export type CompanyStatus =
  | "draft"
  | "pending"
  | "published"
  | "suspended"
  | "archived";

export type Completeness = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;

export interface AdminCompany {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
  logoUrl: string;
  status: CompanyStatus;
  owner: string;
  updatedAt: string;
  completeness: Completeness | number;
  flags: string[];
  tags: string[];
}
