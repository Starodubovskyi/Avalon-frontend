"use client";

import PaymentCard from "./PaymentCard";
import AddCardTile from "./AddCardTile";
import type { SavedCard } from "@/components/types/billing/cards";
import { CreditCard } from "lucide-react";

export default function PaymentMethods({
  surfaceClass,
  cards,
}: {
  surfaceClass: string;
  cards: SavedCard[];
}) {
  const hasCards = Array.isArray(cards) && cards.length > 0;

  return (
    <div className={`${surfaceClass} p-8`}>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-gray-400" />
        Payment Methods
      </h3>

      {hasCards ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-[2rem] overflow-hidden shadow-sm transition-shadow hover:shadow-md"
            >
              <PaymentCard
                surfaceClass="rounded-[2rem] overflow-hidden"
                card={card}
                cardId={(card as any).id ?? `idx_${idx}`}
              />
            </div>
          ))}
          <div className="rounded-[2rem] overflow-hidden">
            <AddCardTile surfaceClass="rounded-[2rem] overflow-hidden" />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="rounded-[2rem] overflow-hidden">
            <AddCardTile
              surfaceClass="rounded-[2rem] overflow-hidden"
              fullHeight
            />
          </div>
        </div>
      )}
    </div>
  );
}
