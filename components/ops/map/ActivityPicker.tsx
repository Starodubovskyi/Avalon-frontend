"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronRight, Crown, Lock, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACTIVITY_CODES, type ActivityCode } from "@/lib/points/activities";
import { usePointLabels } from "@/lib/points/labels";
import { TextInput, btn } from "../ui/primitives";

/**
 * Business Activity: a button that opens a searchable list of the 14 activities.
 * The point has `slots` (one is free); once they are used the others carry a lock and
 * `unlock` (the paid "Unlock another activity" control) is offered right in the list.
 */
export function ActivityPicker({
  value,
  onChange,
  slots,
  unlock,
}: {
  value: ActivityCode[];
  onChange: (next: ActivityCode[]) => void;
  slots: number;
  unlock?: ReactNode;
}) {
  const t = useTranslations("points");
  const labels = usePointLabels();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [lockHint, setLockHint] = useState(false);
  const full = value.length >= slots;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ACTIVITY_CODES.filter((c) => !q || labels.activity(c).toLowerCase().includes(q));
  }, [query, labels]);

  function pick(code: ActivityCode) {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code));
      setLockHint(false);
      return;
    }
    if (full) {
      setLockHint(true);
      return;
    }
    const next = [...value, code];
    onChange(next);
    if (next.length >= slots) setOpen(false);
  }

  function openPicker() {
    setQuery("");
    setLockHint(false);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="flex min-h-10 w-full items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2 text-left text-sm shadow-[0_1px_2px_hsl(var(--shadow-color)/0.04)] transition hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
        aria-haspopup="dialog"
      >
        <span className={cn("min-w-0 flex-1", value.length ? "font-medium" : "text-muted-foreground/80")}>
          {value.length ? value.map((c) => labels.activity(c)).join(", ") : t("activityPicker.choose")}
        </span>
        <span className="tabular shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {value.length}/{slots}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[86svh] max-w-md flex-col gap-3 overflow-hidden rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{t("activityPicker.title")}</DialogTitle>
            <DialogDescription>{t("activityPicker.description", { slots })}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("activityPicker.search")}
              className="h-10 pl-9"
              aria-label={t("activityPicker.search")}
            />
          </div>
          {lockHint ? (
            <div role="status" className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-900 dark:text-amber-100">
              <p className="flex items-start gap-2">
                <Crown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {unlock ? t("activityPicker.lockedWithUnlock") : t("activityPicker.lockedNew")}
              </p>
              {unlock}
            </div>
          ) : null}
          <ul className="-mx-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1" role="listbox" aria-label={t("activityPicker.title")}>
            {rows.map((code) => {
              const selected = value.includes(code);
              const locked = full && !selected;
              return (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-disabled={locked}
                    onClick={() => pick(code)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                      selected ? "bg-primary/10 font-semibold text-foreground ring-1 ring-primary/30" : locked ? "text-muted-foreground hover:bg-muted/60" : "hover:bg-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : locked ? <Lock className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">{labels.activity(code)}</span>
                    {selected ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <X className="h-3 w-3" /> {t("activityPicker.remove")}
                      </span>
                    ) : locked ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        <Lock className="h-2.5 w-2.5" /> {t("activityPicker.premium")}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
            {rows.length === 0 ? <li className="px-3 py-8 text-center text-sm text-muted-foreground">{t("activityPicker.noMatch", { query })}</li> : null}
          </ul>
          <div className="flex justify-end">
            <button type="button" onClick={() => setOpen(false)} className={cn(btn.secondary, "h-10")}>
              {t("activityPicker.done")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
