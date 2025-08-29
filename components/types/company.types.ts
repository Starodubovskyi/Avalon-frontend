export type Company = {
  id: string;
  businessName: string;
  legalName?: string;
  activity?: string;
  tagline?: string;

  bannerUrl?: string;
  logoUrl?: string;
  pinUrl?: string; // иконка/пин для карты

  description?: string;
  website?: string;
  email?: string;
  founded?: string;
  employees?: string | number;
  servicedPorts?: string;

  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;

  lat: number;
  lng: number;

  telephone?: string;
  fax?: string;
  poBox?: string;

  category?: string;
  status?: string;
};
