"use client";

import { NewCardInput } from "@/components/types/billing/types";
import { detectBrand, maskForPreview } from "@/components/types/billing/validate";

export default function CardPreview({ input }: { input: NewCardInput }) {
  const brand = detectBrand(input.number);
  return (
    <div
      className="relative h-48 w-full rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.55), rgba(16,185,129,0.55))" }}
    >
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="relative h-full w-full p-6 text-white flex flex-col justify-between">
        <div className="text-lg font-semibold tracking-wide">{brand?.toUpperCase() || "CARD"}</div>
        <div className="text-2xl tracking-wider">{maskForPreview(input.number)}</div>
        <div className="flex items-center justify-between text-xs opacity-90">
          <div>
            <div className="opacity-80">NAME</div>
            <div className="mt-0.5 text-sm">{input.name || "—"}</div>
          </div>
          <div className="text-right">
            <div className="opacity-80">VALID THRU</div>
            <div className="mt-0.5 text-sm">{input.exp || "MM/YY"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
