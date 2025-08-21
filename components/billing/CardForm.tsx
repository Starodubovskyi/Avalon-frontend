"use client";

import { NewCardInput } from "@/components/types/billing/types";
import { useEffect, useMemo } from "react";
import {
  detectBrand,
  isCardNumberValid,
  isCvcValid,
  isExpValid,
  normalizeCardNumber,
  normalizeExp,
} from "@/components/types/billing/validate";

export default function CardForm({
  value,
  onChange,
  onValidChange,
}: {
  value: NewCardInput;
  onChange: (v: NewCardInput) => void;
  onValidChange: (ok: boolean) => void;
}) {
  const brand = useMemo(() => detectBrand(value.number), [value.number]);
  const validNumber = isCardNumberValid(value.number);
  const validExp = isExpValid(value.exp);
  const validCvc = isCvcValid(value.cvc, brand);
  const validName = value.name.trim().length > 1;

  const isValid = validNumber && validExp && validCvc && validName;

  useEffect(() => onValidChange(isValid), [isValid, onValidChange]);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400">Card number</label>
        <input
          value={value.number}
          onChange={(e) => onChange({ ...value, number: normalizeCardNumber(e.target.value) })}
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-white/5 ${
            validNumber || value.number.length === 0
              ? "border-gray-200 dark:border-white/10"
              : "border-rose-400/60 focus:outline-none"
          }`}
        />
        {!validNumber && value.number.length > 0 && (
          <p className="mt-1 text-xs text-rose-400">Enter a valid card number.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Expiry</label>
          <input
            value={value.exp}
            onChange={(e) => onChange({ ...value, exp: normalizeExp(e.target.value) })}
            inputMode="numeric"
            placeholder="MM/YY"
            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-white/5 ${
              validExp || value.exp.length === 0
                ? "border-gray-200 dark:border-white/10"
                : "border-rose-400/60 focus:outline-none"
            }`}
          />
          {!validExp && value.exp.length > 0 && (
            <p className="mt-1 text-xs text-rose-400">Use format MM/YY and a future date.</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">CVC</label>
          <input
            value={value.cvc}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, brand === "amex" ? 4 : 3);
              onChange({ ...value, cvc: v });
            }}
            inputMode="numeric"
            placeholder={brand === "amex" ? "4 digits" : "3 digits"}
            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-white/5 ${
              validCvc || value.cvc.length === 0
                ? "border-gray-200 dark:border-white/10"
                : "border-rose-400/60 focus:outline-none"
            }`}
          />
          {!validCvc && value.cvc.length > 0 && (
            <p className="mt-1 text-xs text-rose-400">
              {brand === "amex" ? "4 digits for Amex." : "3 digits CVC."}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400">Cardholder name</label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="John Smith"
          className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-white/5 ${
            validName || value.name.length === 0
              ? "border-gray-200 dark:border-white/10"
              : "border-rose-400/60 focus:outline-none"
          }`}
        />
        {!validName && value.name.length > 0 && (
          <p className="mt-1 text-xs text-rose-400">Enter the cardholder’s name.</p>
        )}
      </div>
    </div>
  );
}
