export interface Company {
  id?: string;
  logoUrl?: string;
  bannerUrl?: string;
  pinUrl?: string;
  legalName: string;
  businessName: string;
  activity: string;
  employees: string;
  founded: string;
  email: string;
  website: string;
  telephone: string;
  fax: string;
  address: string;
  servicedPorts?: string; // Новый тип
  city: string;
  state?: string; // Новый тип
  postalCode: string;
  country: string;
  poBox?: string; // Новый тип
  tagline?: string; // Новый тип
  description: string;
  lat: number;
  lng: number;
  checkbox?: boolean;
}
