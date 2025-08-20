// components/types/billing/cards.ts
import type { CardModel, NewCardInput } from "./types";
import { detectBrand, last4FromNumber } from "./validate";

const KEY = "app:billing:cards";

export type CardGradient = "goldGreen" | "purpleBlue" | "roseIndigo";

export type CardStyle =
  | { kind: "gradient"; gradient: CardGradient }
  | { kind: "image"; dataUrl: string }; 

export type SavedCard = CardModel & {
  id: string;
  createdAt: number;
  isDefault?: boolean;
  style?: CardStyle; 
};

function read(): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedCard[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedCard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

export function listCards(): SavedCard[] {
  return read();
}

export function addCard(input: NewCardInput): SavedCard {
  const items = read();
  const brand = detectBrand(input.number) || "visa";
  const last4 = last4FromNumber(input.number);

  const expMonth = parseInt(input.exp.slice(0, 2) || "0", 10);
  const expYear = 2000 + parseInt(input.exp.slice(3, 5) || "0", 10);

  const item: SavedCard = {
    id: `card_${Date.now()}`,
    brand,
    mask: `**** **** **** ${last4}`,
    name: input.name.trim(),
    expMonth,
    expYear,
    createdAt: Date.now(),
    style: { kind: "gradient", gradient: "goldGreen" }, // дефолт
  };

  const next = [item, ...items];
  write(next);
  return item;
}

export function updateCard(
  id: string,
  patch: Partial<Omit<SavedCard, "id" | "createdAt">> & { style?: CardStyle }
): SavedCard | null {
  const items = read();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...patch } as SavedCard;
  items[idx] = updated;
  write(items);
  return updated;
}

export function removeCard(id: string) {
  const items = read().filter((c) => c.id !== id);
  write(items);
}
