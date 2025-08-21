import { invoices as base } from "./data";
import type { Invoice } from "./types";

const KEY = "app:billing:invoiceOverrides";

type Overrides = Record<string, "paid" | "failed">;

function readOverrides(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

export function setInvoiceStatus(id: string, status: "paid" | "failed") {
  if (typeof window === "undefined") return;
  const o = readOverrides();
  o[id] = status;
  localStorage.setItem(KEY, JSON.stringify(o));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

export function getInvoices(): Invoice[] {
  const o = readOverrides();
  return base.map((i) => (o[i.id] ? { ...i, status: o[i.id] } : i));
}
 


export function appendInvoice(inv: Invoice) {
  const list: Invoice[] = getInvoices();
  list.unshift(inv);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}