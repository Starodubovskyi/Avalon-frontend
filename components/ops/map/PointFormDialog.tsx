"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { POINT_KINDS, type PointKind, type TeamPoint } from "@/lib/points/team-points";
import { usePointQuota, useTeamPointMutations, useTeamPoints } from "@/lib/points/hooks";
import { usePointLabels } from "@/lib/points/labels";
import { TITLE_MAX } from "@/lib/points/limits";
import { usePointLogoUrl } from "@/lib/points/logo-cache";
import { Field, Spinner, TextInput, btn } from "../ui/primitives";
import { POINT_KIND_CLASS, POINT_KIND_ICON } from "./PointKindIcon";
import { LogoUploader } from "./LogoUploader";
import { ActivityPicker } from "./ActivityPicker";
import { ActivitySlotUnlock } from "./ActivitySlotUnlock";
import { PointEmailField } from "./PointEmailField";
import { PointProfileFields } from "./PointProfileFields";
import { defaultVisibility, initialPointForm, pointFormInput, reverseGeocode, validatePointForm, type PointFormState } from "./pointForm";

export function PointFormDialog({
  open,
  onOpenChange,
  point,
  at,
  defaultKind,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  point?: TeamPoint | null;
  at?: [number, number] | null;
  defaultKind: PointKind;
  onSaved?: (p: TeamPoint) => void;
}) {
  const t = useTranslations("points");
  const locale = useLocale();
  const labels = usePointLabels();
  const { create, update } = useTeamPointMutations();
  const { data: allPoints } = useTeamPoints();
  const quota = usePointQuota(allPoints);
  // the live copy: a bought slot or a confirmed email shows up while the dialog is open
  const live = useMemo(() => (point ? allPoints?.find((p) => p.id === point.id) ?? point : null), [allPoints, point]);
  // a branch may only hang under a head office the caller can edit (else 422 parentId notFound)
  const headOffices = useMemo(() => (allPoints ?? []).filter((p) => p.kind === "head_office" && p.canEdit && p.id !== point?.id), [allPoints, point?.id]);
  const [form, setForm] = useState<PointFormState>(() => initialPointForm(point, defaultKind));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const wasOpen = useRef(false);
  const storedLogo = usePointLogoUrl(open ? point : null);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setForm(initialPointForm(point, defaultKind));
      setError(null);
    }
    wasOpen.current = open;
  }, [open, point, defaultKind]);

  // a stored parent that is not among the choices is shown as "none" and kept unless the user picks one
  useEffect(() => {
    if (!open || !allPoints) return;
    setForm((f) => (f.parentId && !f.parentTouched && !headOffices.some((h) => h.id === f.parentId) ? { ...f, parentId: "" } : f));
  }, [open, allPoints, headOffices]);

  useEffect(() => {
    if (!open || point || !at) return;
    const ctrl = new AbortController();
    reverseGeocode(at, ctrl.signal, locale)
      .then((addr) => addr && setForm((f) => (f.address ? f : { ...f, address: addr })))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [open, point, at, locale]);

  const set = <K extends keyof PointFormState>(k: K, v: PointFormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  // backend default: private_person → team, other kinds → public; the user can still override it
  const setKind = (kind: PointKind) => setForm((f) => (f.visibilityTouched ? { ...f, kind } : { ...f, kind, visibility: defaultVisibility(kind) }));
  const setField: typeof set = (k, v) => {
    if (k === "visibility") setForm((f) => ({ ...f, visibility: v as PointFormState["visibility"], visibilityTouched: true }));
    else if (k === "parentId") setForm((f) => ({ ...f, parentId: v as string, parentTouched: true }));
    else set(k, v);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validatePointForm(form);
    if (problem) return setError(t(problem));
    setBusy(true);
    setError(null);
    const input = pointFormInput(form, point);
    try {
      const saved = point ? await update(point.id, input) : at ? await create({ ...input, lat: at[1], lng: at[0] }) : null;
      if (saved) onSaved?.(saved);
      onOpenChange(false);
    } catch {
      /* toast already shown */
    } finally {
      setBusy(false);
    }
  }

  const coords = point ? [point.lng, point.lat] : at;
  const slots = live?.activitySlots ?? 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{point ? t("form.editTitle") : t("form.newTitle")}</DialogTitle>
          <DialogDescription>
            {!point && quota.limited ? t("form.quota", { remaining: quota.remaining ?? 0, limit: quota.limit }) : t("form.subtitle")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <LogoUploader value={form.newLogo === undefined ? storedLogo : form.newLogo} kind={form.kind} onChange={(logo) => set("newLogo", logo)} />

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground/80">{t("form.geoposition")}</span>
            <div className="flex items-center gap-2 rounded-xl bg-muted/70 px-3 py-2 text-xs font-medium tabular-nums text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              {coords ? `${coords[1].toFixed(5)}°, ${coords[0].toFixed(5)}°` : "—"}
            </div>
            <TextInput
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              maxLength={500}
              placeholder={point ? t("form.address") : t("form.addressAuto")}
              aria-label={t("form.address")}
            />
          </div>

          <Field label={t("form.title")}>
            <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={TITLE_MAX} placeholder={t(`form.titlePlaceholder.${form.kind}`)} autoFocus />
          </Field>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground/80">{t("form.kind")}</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("form.kind")}>
              {POINT_KINDS.map((k) => {
                const Icon = POINT_KIND_ICON[k];
                const active = form.kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setKind(k)}
                    title={labels.kindHint(k)}
                    className={cn(
                      "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center text-[11px] font-semibold leading-tight transition",
                      active ? cn("ring-2", POINT_KIND_CLASS[k].ring, POINT_KIND_CLASS[k].tile, "border-transparent") : "hover:bg-accent",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active ? "" : "text-muted-foreground")} />
                    {labels.kindShort(k)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{labels.kindHint(form.kind)}</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground/80">{t("form.activity")}</span>
            <ActivityPicker
              value={form.activities}
              onChange={(next) => set("activities", next)}
              slots={slots}
              unlock={live?.canEdit ? <ActivitySlotUnlock point={live} /> : undefined}
            />
            {live?.canEdit && form.activities.length >= slots ? <ActivitySlotUnlock point={live} /> : null}
            {!point ? <p className="text-xs text-muted-foreground">{t("form.activityNewHint")}</p> : null}
          </div>

          <PointProfileFields form={form} set={setField} pointId={point?.id ?? null} headOffices={headOffices} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("form.phone")}>
              <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" maxLength={50} autoComplete="tel" />
            </Field>
            <PointEmailField value={form.email} onChange={(v) => set("email", v)} point={live} />
          </div>

          {error ? <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{error}</p> : null}

          <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-2 border-t bg-background/95 px-6 py-3 backdrop-blur">
            <button type="button" onClick={() => onOpenChange(false)} className={btn.secondary}>
              {t("form.cancel")}
            </button>
            <button type="submit" disabled={busy || (!point && quota.remaining === 0)} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              {point ? t("form.save") : t("form.add")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
