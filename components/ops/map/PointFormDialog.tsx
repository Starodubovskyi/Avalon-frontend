"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  POINT_KINDS,
  POINT_KIND_HINT,
  POINT_KIND_LABEL,
  isOrgKind,
  useTeamPointMutations,
  type PointKind,
  type TeamPoint,
  type TeamPointInput,
} from "@/lib/points/team-points";
import { Field, Spinner, TextArea, TextInput, btn } from "../ui/primitives";
import { POINT_KIND_CLASS, POINT_KIND_ICON } from "./PointKindIcon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_LABEL: Record<PointKind, string> = {
  company: "Business (owner, charterer, supplier…)",
  agency: "Services (port agency, ship agency…)",
  terminal: "Cargo / berth details",
  authority: "Department (customs, harbour master…)",
  person: "Role / company",
  employee: "Position",
};

const NAME_LABEL: Record<PointKind, string> = {
  company: "Company name *",
  agency: "Agency name *",
  terminal: "Terminal / berth name *",
  authority: "Authority name *",
  person: "First name *",
  employee: "First name *",
};

interface FormState {
  kind: PointKind;
  firstName: string;
  lastName: string;
  activity: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

function initial(point: TeamPoint | null | undefined, kind: PointKind): FormState {
  return {
    kind: point?.kind ?? kind,
    firstName: point?.firstName ?? "",
    lastName: point?.lastName ?? "",
    activity: point?.activity ?? "",
    phone: point?.phone ?? "",
    email: point?.email ?? "",
    address: point?.address ?? "",
    notes: point?.notes ?? "",
  };
}

/** Best-effort street address for a new pin (Mapbox reverse geocoding, public token) */
async function reverseGeocode([lng, lat]: [number, number], signal: AbortSignal): Promise<string | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  if (!token) return null;
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&limit=1&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const body: unknown = await res.json();
  const feature = (body as { features?: { properties?: { full_address?: string; place_formatted?: string } }[] }).features?.[0];
  return feature?.properties?.full_address ?? feature?.properties?.place_formatted ?? null;
}

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
  const { create, update } = useTeamPointMutations();
  const [form, setForm] = useState<FormState>(() => initial(point, defaultKind));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setForm(initial(point, defaultKind));
      setError(null);
    }
    wasOpen.current = open;
  }, [open, point, defaultKind]);

  useEffect(() => {
    if (!open || point || !at) return;
    const ctrl = new AbortController();
    reverseGeocode(at, ctrl.signal)
      .then((addr) => addr && setForm((f) => (f.address ? f : { ...f, address: addr })))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [open, point, at]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim()) return setError(isOrgKind(form.kind) ? "Enter the name" : "Enter the first name");
    if (form.email && !EMAIL_RE.test(form.email.trim())) return setError("Invalid email");
    setBusy(true);
    setError(null);
    const input: TeamPointInput = {
      kind: form.kind,
      firstName: form.firstName.trim(),
      lastName: isOrgKind(form.kind) ? "" : form.lastName.trim(),
      activity: form.activity.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    };
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{point ? "Edit point" : "New point on the map"}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {coords ? `${coords[1].toFixed(5)}°, ${coords[0].toFixed(5)}°` : "—"} · visible to Avalon staff
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Point type">
            {POINT_KINDS.map((k) => {
              const Icon = POINT_KIND_ICON[k];
              const active = form.kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("kind", k)}
                  title={POINT_KIND_HINT[k]}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center text-[11px] font-semibold leading-tight transition",
                    active ? cn("ring-2", POINT_KIND_CLASS[k].ring, POINT_KIND_CLASS[k].tile, "border-transparent") : "hover:bg-accent",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "" : "text-muted-foreground")} />
                  {POINT_KIND_LABEL[k]}
                </button>
              );
            })}
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">{POINT_KIND_HINT[form.kind]}</p>

          {isOrgKind(form.kind) ? (
            <Field label={NAME_LABEL[form.kind]}>
              <TextInput value={form.firstName} onChange={(e) => set("firstName", e.target.value)} autoFocus />
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label={NAME_LABEL[form.kind]}>
                <TextInput value={form.firstName} onChange={(e) => set("firstName", e.target.value)} autoFocus />
              </Field>
              <Field label="Last name">
                <TextInput value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </Field>
            </div>
          )}
          <Field label={ROLE_LABEL[form.kind]}>
            <TextInput value={form.activity} onChange={(e) => set("activity", e.target.value)} maxLength={255} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone / WhatsApp">
              <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" maxLength={50} />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} />
            </Field>
          </div>
          <Field label="Address" hint={point ? undefined : "Filled from the map when available"}>
            <TextInput value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={500} />
          </Field>
          <Field label="Notes">
            <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={2000} className="min-h-[64px]" />
          </Field>

          {error ? <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => onOpenChange(false)} className={btn.secondary}>Cancel</button>
            <button type="submit" disabled={busy} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              {point ? "Save" : "Add to map"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
