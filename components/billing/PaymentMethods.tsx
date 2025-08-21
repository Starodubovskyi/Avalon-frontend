"use client";

import PaymentCard from "./PaymentCard";
import AddCardTile from "./AddCardTile";
import type { CardModel } from "@/components/types/billing/types";
import type { SavedCard } from "@/components/types/billing/cards";


export default function PaymentMethods({
  surfaceClass,
  cards,
}: {
  surfaceClass: string;
  cards: SavedCard[];
}) {
  const hasCards = Array.isArray(cards) && cards.length > 0;

  return (
    <div className={`${surfaceClass} p-5 sm:p-6`}>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Payment Method
      </h3>

      {hasCards ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {cards.map((card, idx) => (
  <div key={idx} className="rounded-2xl overflow-hidden">
    <PaymentCard
      surfaceClass="rounded-2xl overflow-hidden"
      card={card}
      cardId={(card as any).id ?? `idx_${idx}`} 
    />
  </div>
))}
          <div className="rounded-2xl overflow-hidden">
            <AddCardTile surfaceClass="rounded-2xl overflow-hidden" />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="rounded-2xl overflow-hidden">
            <AddCardTile surfaceClass="rounded-2xl overflow-hidden" fullHeight />
          </div>
        </div>
      )}
    </div>
  );
}
