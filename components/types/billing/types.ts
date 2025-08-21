import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type Billing = "monthly" | "yearly";

export type Feature = { label: string; included: boolean };



export type Usage = {
  apiUsed: number;
  apiLimit: number;
  storageUsedGb: number;
  storageLimitGb: number;
};

export type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "failed";
  invoiceUrl?: string | null;
};

export type CardModel = {
  brand: "visa" | "mastercard" | "amex";
  mask: string;
  name: string;
  expMonth: number;
  expYear: number;
};

export type NewCardInput = {
  number: string;
  exp: string;
  cvc: string;
  name: string;
};
