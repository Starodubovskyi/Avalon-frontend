"use client";

import { NewCardInput } from "@/components/types/billing/types";
import {
  detectBrand,
  maskForPreview,
} from "@/components/types/billing/validate";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

export default function CardPreview({ input }: { input: NewCardInput }) {
  const brand = detectBrand(input.number);
  return (
    <div
      className={`relative h-56 w-full rounded-[2rem] overflow-hidden shadow-2xl ${GRADIENT_BG}`}
    >
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      <div className="relative h-full w-full p-8 text-white flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="text-xl font-bold tracking-widest uppercase font-mono opacity-90">
            {brand?.toUpperCase() || "CARD"}
          </div>
          <div className="w-12 h-8 bg-white/20 rounded-lg backdrop-blur-md border border-white/10" />
        </div>

        <div className="text-2xl font-mono tracking-widest drop-shadow-md">
          {maskForPreview(input.number)}
        </div>

        <div className="flex items-center justify-between text-xs font-bold tracking-wider opacity-90">
          <div>
            <div className="opacity-70 mb-1 text-[10px]">CARD HOLDER</div>
            <div className="uppercase text-sm">{input.name || "YOUR NAME"}</div>
          </div>
          <div className="text-right">
            <div className="opacity-70 mb-1 text-[10px]">EXPIRES</div>
            <div className="text-sm">{input.exp || "MM/YY"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
