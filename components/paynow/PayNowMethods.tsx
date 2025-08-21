"use client";

import type { SavedCard } from "@/components/types/billing/cards";
import PayOtherMethods from "./PayOtherMethods";

export default function PayNowMethods({
  mode,
  setMode,
  saved,
  selectedCardId,
  onSelect,
  onChooseOther,
}: {
  mode: "saved" | "new" | "other";
  setMode: (m: "saved" | "new" | "other") => void;
  saved: SavedCard[];
  selectedCardId: string | null;
  onSelect: (id: string) => void;
  onChooseOther: (p: "paypal" | "googlepay" | "applepay") => void;
}) {
  return (
    <>
      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-gray-200 p-1 dark:border-white/10">
        <button
          onClick={() => setMode("saved")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            mode === "saved"
              ? "bg-white shadow dark:bg-white/10"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Use saved card
        </button>
        <button
          onClick={() => setMode("new")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            mode === "new"
              ? "bg-white shadow dark:bg-white/10"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Add new card
        </button>
        <button
          onClick={() => setMode("other")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            mode === "other"
              ? "bg-white shadow dark:bg-white/10"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Other methods
        </button>
      </div>

      {/* Body */}
      {mode === "saved" && (
        <div className="mt-4 space-y-3">
          {saved.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No saved cards. Use “Add new card”.
            </div>
          ) : (
            saved.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm shadow-sm dark:bg-white/5 dark:border-white/10 ${
                  selectedCardId === c.id
                    ? "border-gray-900 dark:border-white"
                    : "border-gray-200 hover:bg-gray-50 dark:hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium uppercase">{c.brand}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {c.mask} • {String(c.expMonth).padStart(2, "0")}/{String(c.expYear).slice(-2)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{c.name}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {mode === "other" && (
        <PayOtherMethods onChoose={onChooseOther} />
      )}
    </>
  );
}
