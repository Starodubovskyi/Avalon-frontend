"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApiErrorText } from "@/lib/api/fieldErrors";
import { TOP_UP_MAX, TOP_UP_MIN, TOP_UP_NOTE_MAX, WALLET_ERRORS } from "@/lib/wallet/api";
import { useWalletActions } from "@/lib/wallet/hooks";
import { Field, Spinner, TextArea, TextInput, btn } from "../ui/primitives";

const PRESETS = [50, 100, 250, 500] as const;

/** Ask the team for credits; one request may be pending at a time (422 pendingExists) */
export function TopUpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("balance");
  const format = useFormatter();
  const errorText = useApiErrorText("balance", WALLET_ERRORS);
  const { requestTopUp } = useWalletActions();
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("100");
      setNote("");
      setError(null);
    }
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isInteger(value) || value < TOP_UP_MIN || value > TOP_UP_MAX) {
      setError(t("topUp.amountRange", { min: TOP_UP_MIN, max: format.number(TOP_UP_MAX) }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await requestTopUp(value, note.trim() || null);
      toast.success(t("topUp.sent"), { description: t("topUp.sentText") });
      onOpenChange(false);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-md overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t("topUp.title")}</DialogTitle>
          <DialogDescription>{t("topUp.text")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label={t("topUp.presets")}>
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                aria-pressed={amount === String(p)}
                className={cn(
                  "tabular h-11 rounded-xl border text-sm font-bold transition",
                  amount === String(p) ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "hover:bg-accent",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Field label={t("topUp.amount")} hint={t("topUp.amountHint")}>
            <TextInput type="number" inputMode="numeric" min={TOP_UP_MIN} max={TOP_UP_MAX} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="tabular text-base" />
          </Field>
          <Field label={t("topUp.note")} hint={t("topUp.noteHint")}>
            <TextArea value={note} onChange={(e) => setNote(e.target.value)} maxLength={TOP_UP_NOTE_MAX} rows={2} placeholder={t("topUp.notePlaceholder")} />
          </Field>
          {error ? (
            <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className={btn.secondary}>
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={busy} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              {t("topUp.submit")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
