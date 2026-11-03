"use client";

import { useState, type FormEvent } from "react";
import { BriefcaseBusiness, Clock3, Crown, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCompanyActions } from "@/lib/companies/hooks";
import { POSITION_MAX, type CompanyProfile } from "@/lib/companies/types";
import { pointTitle } from "@/lib/points/team-points";
import { Field, Spinner, TextInput, btn } from "../ui/primitives";

/** "I work here" → request; pending → cancel; member → leave; owner → a badge */
export function MembershipButton({ profile }: { profile: CompanyProfile }) {
  const t = useTranslations("companies");
  const { join, leave } = useCompanyActions(profile.point.id);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const done = await join(position.trim() || null);
    setBusy(false);
    if (done) setOpen(false);
  }

  async function onLeave(confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    await leave();
    setBusy(false);
  }

  if (profile.myMembership === "owner") {
    return (
      <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
        <Crown className="h-4 w-4" aria-hidden /> {t("membership.owner")}
      </span>
    );
  }
  if (profile.myMembership === "pending") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-stage-expected/10 px-3 text-sm font-semibold text-stage-expected">
          <Clock3 className="h-4 w-4" aria-hidden /> {t("membership.pending")}
        </span>
        <button type="button" disabled={busy} onClick={() => void onLeave(t("membership.cancelConfirm"))} className={cn(btn.ghost, "h-10")}>
          {t("membership.cancel")}
        </button>
      </div>
    );
  }
  if (profile.myMembership === "active") {
    return (
      <button type="button" disabled={busy} onClick={() => void onLeave(t("membership.leaveConfirm", { title: pointTitle(profile.point) }))} className={cn(btn.secondary, "h-10")}>
        <LogOut className="h-4 w-4" /> {t("membership.leave")}
      </button>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(btn.primary, "h-10")}>
        <BriefcaseBusiness className="h-4 w-4" /> {t("membership.join")}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{t("membership.joinTitle", { title: pointTitle(profile.point) })}</DialogTitle>
            <DialogDescription>{t("membership.joinText")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <Field label={t("membership.position")} hint={t("membership.positionHint")}>
              <TextInput value={position} onChange={(e) => setPosition(e.target.value)} maxLength={POSITION_MAX} placeholder={t("membership.positionPlaceholder")} autoFocus />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className={btn.secondary}>
                {t("membership.close")}
              </button>
              <button type="submit" disabled={busy} className={btn.primary}>
                {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null} {t("membership.send")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
