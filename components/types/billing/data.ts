import { CardModel, Invoice,  Usage } from "./types";



export const usage: Usage = {
  apiUsed: 8500,
  apiLimit: 10000,
  storageUsedGb: 2,
  storageLimitGb: 5,
};

export const invoices: Invoice[] = [
  {
    id: "inv_aug_03",
    date: "Aug 03, 2025",
    description: "Pro Plan – Monthly",
    amount: 29,
    status: "paid",
    invoiceUrl: "#",
  },
  {
    id: "inv_aug_01",
    date: "Aug 01, 2025",
    description: "Pro Plan – Monthly",
    amount: 29,
    status: "failed",
    invoiceUrl: null,
  },
  {
    id: "inv_jul_01",
    date: "Jul 01, 2025",
    description: "Pro Plan – Monthly",
    amount: 29,
    status: "paid",
    invoiceUrl: "#",
  },
];

export const cards: CardModel[] = [
  {
    brand: "visa",
    mask: "1520 0100 3356 6888",
    name: "John Smith",
    expMonth: 11,
    expYear: 2024,
  },
];
