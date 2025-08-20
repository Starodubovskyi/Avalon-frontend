export type Billing = "monthly" | "yearly";

export type Feature = { label: string; included: boolean };

export type Plan = {
  id: string;
  name: string;
  tagline: string;
  icon: JSX.Element;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  features: Feature[];
};
