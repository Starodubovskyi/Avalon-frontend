"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApiErrorText } from "@/lib/api/fieldErrors";
import { personName } from "@/lib/network/format";
import { CREDIT_NOTE_MAX, TOP_UP_MAX, WALLET_ERRORS } from "@/lib/wallet/api";
import { useWalletActions } from "@/lib/wallet/hooks";
import type { WalletAccount } from "@/lib/wallet/types";
import { Field, Spinner, TextInput, btn } from "../ui/primitives";

type Mode = "credit" | "adjust";

/** Admin: credit credits to an account or take some off (an adjustment) */
export function CreditDialog({ account, onClose }: { account: WalletAccount | null; onClose: () => void }) {
  const t = useTranslations("balance");
  const format = useFormatter();
  const errorText = useApiErrorText("balance", WALLET_ERRORS);
  const { credit } = useWalletActions();
  const [mode, setMode] = useState<Mode>("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (account) {
      setMode("credit");
      setAmount("");
      setNote("");
      setError(null);
    }
  }, [account]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!account) return;
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1 || value > TOP_UP_MAX) {
      setError(t("credit.amountRange", { max: format.number(TOP_UP_MAX) }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const signed = mode === "credit" ? value : -value;
      const tx = await credit(account.user.id, signed, note.trim() || null);
      toast.success(t(mode === "credit" ? "credit.credited" : "credit.adjusted", { amount: format.number(value), name: personName(account.user) }), {
        description: t("credit.newBalance", { balance: format.number(tx.balanceAfter) }),
      });
      onClose();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!account} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{account ? personName(account.user) : ""}</DialogTitle>
          <DialogDescription>{account ? t("credit.current", { balance: format.number(account.balance) }) : ""}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label={t("credit.mode")}>
            {(["credit", "adjust"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={cn("min-h-10 rounded-lg text-[13px] font-semibold transition", mode === m ? "bg-card text-foreground shadow-card" : "text-muted-foreground")}
              >
                {t(`credit.${m}`)}
              </button>
            ))}
          </div>
          <Field label={t("credit.amount")} hint={mode === "credit" ? t("credit.creditHint") : t("credit.adjustHint")}>
            <TextInput type="number" inputMode="numeric" min={1} max={TOP_UP_MAX} value={amount} onChange={(e) => setAmount(e.target.value)} className="tabular text-base" autoFocus />
          </Field>
          <Field label={t("credit.note")}>
            <TextInput value={note} onChange={(e) => setNote(e.target.value)} maxLength={CREDIT_NOTE_MAX} placeholder={t("credit.notePlaceholder")} />
          </Field>
          {error ? (
            <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={btn.secondary}>
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={busy} className={mode === "credit" ? btn.primary : btn.danger}>
              {busy ? <Spinner className="h-4 w-4" /> : null}
              {mode === "credit" ? t("credit.submitCredit") : t("credit.submitAdjust")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
