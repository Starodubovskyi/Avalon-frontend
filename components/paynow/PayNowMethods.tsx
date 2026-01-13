import { Dispatch, SetStateAction } from "react";
import { CreditCard, Plus, Wallet } from "lucide-react";
import { SavedCard } from "@/components/types/billing/cards";

type Props = {
  mode: "saved" | "new" | "other";
  setMode: Dispatch<SetStateAction<"saved" | "new" | "other">>;
  saved: SavedCard[];
  selectedCardId: string | null;
  onSelect: Dispatch<SetStateAction<string | null>>;
  onChooseOther: (provider: string) => void;
};

export default function PayNowMethods({
  mode,
  setMode,
  saved,
  selectedCardId,
  onSelect,
  onChooseOther,
}: Props) {
  const formatExp = (m: number, y: number) => {
    const mm = m.toString().padStart(2, "0");
    const yy = y.toString().slice(-2);
    return `${mm}/${yy}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Payment Method
      </h3>

      <div className="flex gap-2">
        {saved.length > 0 && (
          <button
            onClick={() => setMode("saved")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
              mode === "saved"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-400"
            }`}
          >
            <Wallet size={16} />
            Saved
          </button>
        )}

        <button
          onClick={() => setMode("new")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
            mode === "new"
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-400"
          }`}
        >
          <Plus size={16} />
          New Card
        </button>
      </div>

      {mode === "saved" && (
        <div className="space-y-2 mt-4">
          {saved.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelect(card.id)}
              className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${
                selectedCardId === card.id
                  ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
                  : "border-gray-200 hover:border-blue-300 dark:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-white/5">
                  <CreditCard
                    size={18}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {card.brand} •••• {card.mask.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires {formatExp(card.expMonth, card.expYear)}
                  </p>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedCardId === card.id
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {selectedCardId === card.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <p className="text-xs text-gray-500 mb-3">Or pay with</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onChooseOther("paypal")}
            className="flex items-center justify-center py-2 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 transition"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              PayPal
            </span>
          </button>
          <button
            onClick={() => onChooseOther("apple_pay")}
            className="flex items-center justify-center py-2 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 transition"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Apple Pay
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
