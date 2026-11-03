import { useFormatter } from "next-intl";

/** Whole-euro amounts in the reader's language (€10,695 · 10 695 € · 10.695 €); works in server and client components */
export function useEur(): (amount: number) => string {
  const format = useFormatter();
  return (amount: number) => format.number(amount, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}
