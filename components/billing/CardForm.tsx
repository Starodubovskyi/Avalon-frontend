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
import clsx from "clsx";

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

  const inputClass =
    "mt-1.5 w-full rounded-full border-none bg-gray-100/50 dark:bg-white/5 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-400";
  const errorClass = "mt-1.5 ml-2 text-xs font-medium text-red-500";

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">
          Card Number
        </label>
        <input
          value={value.number}
          onChange={(e) =>
            onChange({ ...value, number: normalizeCardNumber(e.target.value) })
          }
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          className={clsx(
            inputClass,
            !validNumber &&
              value.number.length > 0 &&
              "ring-2 ring-red-500/30 bg-red-50/50"
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">
            Expiry
          </label>
          <input
            value={value.exp}
            onChange={(e) =>
              onChange({ ...value, exp: normalizeExp(e.target.value) })
            }
            inputMode="numeric"
            placeholder="MM/YY"
            className={clsx(
              inputClass,
              !validExp &&
                value.exp.length > 0 &&
                "ring-2 ring-red-500/30 bg-red-50/50"
            )}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">
            CVC
          </label>
          <input
            value={value.cvc}
            onChange={(e) => {
              const v = e.target.value
                .replace(/\D/g, "")
                .slice(0, brand === "amex" ? 4 : 3);
              onChange({ ...value, cvc: v });
            }}
            inputMode="numeric"
            placeholder="123"
            className={clsx(
              inputClass,
              !validCvc &&
                value.cvc.length > 0 &&
                "ring-2 ring-red-500/30 bg-red-50/50"
            )}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">
          Cardholder Name
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="JOHN SMITH"
          className={inputClass}
        />
      </div>
    </div>
  );
}
