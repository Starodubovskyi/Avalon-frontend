"use client";

import { Check, X } from "lucide-react";
import type { Feature } from "./types";

export default function FeatureList({ features }: { features: Feature[] }) {
  return (
    <ul className="mt-5 space-y-2 text-sm">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2">
          {f.included ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <X className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />
          )}
          <span className={f.included ? "" : "opacity-60"}>{f.label}</span>
        </li>
      ))}
    </ul>
  );
}
