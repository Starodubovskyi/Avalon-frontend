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
  servicedPorts?: string; 
  city: string;
  state?: string; 
  postalCode: string;
  country: string;
  poBox?: string; 
  tagline?: string; 
  description: string;
  lat: number;
  lng: number;
  checkbox?: boolean;
}
