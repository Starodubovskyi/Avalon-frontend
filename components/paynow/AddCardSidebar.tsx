"use client";

import CardPreview from "@/components/billing/CardPreview";
import type { NewCardInput } from "@/components/types/billing/types";
import { ShieldCheck, Image, Palette } from "lucide-react";

export default function AddCardSidebar({
  surfaceClass,
  input,
}: {
  surfaceClass: string;
  input: NewCardInput;
}) {
  return (
    <aside className={`${surfaceClass} p-5 sm:p-6`}>
      <div className="mb-5">
        <CardPreview input={input} />
      </div>
      <div className="space-y-3 text-sm">
        <div className="font-medium text-gray-700 dark:text-gray-200">Tips</div>
        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
          <li>• Card number — 16 digits (Amex — 15).</li>
          <li>
            • Expiry — format <b>MM/YY</b>.
          </li>
          <li>• CVC — 3 digits (Amex — 4).</li>
          <li>• Name as shown on the card.</li>
        </ul>
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 p-3 text-sm dark:border-white/10">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-content-center rounded-lg bg-white shadow dark:bg-white/10">
            <Palette className="h-4 w-4" />
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            After saving, you can change the card background
            (gradients or{" "}
            <span className="inline-flex items-center gap-1">
              <Image className="h-3.5 w-3.5" /> your own photo
            </span>
            ). Open the <b>⋯</b> menu in the top-right corner of the card.
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 dark:border-emerald-500/30">
        <ShieldCheck className="h-4 w-4" />
        Connection is secure (TLS). Card details are encrypted and never stored in plain text.
      </div>
    </aside>
  );
}
