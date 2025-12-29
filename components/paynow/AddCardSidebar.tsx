"use client";

import CardPreview from "@/components/billing/CardPreview";
import type { NewCardInput } from "@/components/types/billing/types";
import { ShieldCheck, Image, Palette } from "lucide-react";
import clsx from "clsx";

export default function AddCardSidebar({
  surfaceClass,
  input,
}: {
  surfaceClass: string;
  input: NewCardInput;
}) {
  return (
    <aside
      className={clsx(
        surfaceClass,
        "p-8 rounded-[2.5rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm"
      )}
    >
      <div className="mb-8">
        <CardPreview input={input} />
      </div>

      <div className="space-y-4 text-sm">
        <div className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
          Tips
        </div>
        <ul className="space-y-3 text-gray-600 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-blue-500">•</span> Card number — 16 digits
            (Amex — 15).
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">•</span> Expiry — format{" "}
            <b>MM/YY</b>.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">•</span> CVC — 3 digits (Amex — 4).
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">•</span> Name as shown on the card.
          </li>
        </ul>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 p-4 text-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-content-center rounded-full bg-white shadow-sm dark:bg-white/10 text-purple-500">
            <Palette className="h-5 w-5" />
          </div>
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
            After saving, you can change the card background (gradients or{" "}
            <span className="inline-flex items-center gap-1 font-medium text-gray-900 dark:text-white">
              <Image className="h-3.5 w-3.5" /> photo
            </span>
            ). Open the <b>⋯</b> menu on the card.
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-300 dark:border-emerald-500/10">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <span className="font-medium">Secure Connection (TLS). Encrypted.</span>
      </div>
    </aside>
  );
}
