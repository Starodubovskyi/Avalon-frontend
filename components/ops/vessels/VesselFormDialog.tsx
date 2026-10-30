"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extractAuthError } from "@/lib/api/auth";
import { useVesselMutations } from "@/lib/vessels/hooks";
import { fromLocalInput, toLocalInput } from "@/lib/vessels/format";
import {
  CONDITIONS,
  CONDITION_LABEL,
  DESTINATIONS,
  DESTINATION_LABEL,
  TYPE_LABEL,
  VESSEL_TYPES,
  type Destination,
  type VesselCondition,
  type VesselInput,
  type VesselType,
  type VesselView,
} from "@/lib/vessels/types";
import { Field, SelectInput, Spinner, TextArea, TextInput } from "../ui/primitives";

interface FormState {
  name: string;
  imo: string;
  mmsi: string;
  type: VesselType;
  destination: Destination;
  condition: VesselCondition | "";
  etaSulina: string;
  masterName: string;
  masterPhone: string;
  masterEmail: string;
  officeName: string;
  officePhone: string;
  officeEmail: string;
  portAgent: string;
  notes: string;
}

function initial(v?: VesselView | null): FormState {
  return {
    name: v?.name ?? "",
    imo: v?.imo ?? "",
    mmsi: v?.mmsi ?? "",
    type: v?.type ?? "general_cargo",
    destination: v?.destination ?? "IZMAIL",
    condition: v?.condition ?? "",
    etaSulina: toLocalInput(v?.etaSulina),
    masterName: v?.masterName ?? "",
    masterPhone: v?.masterPhone ?? "",
    masterEmail: v?.masterEmail ?? "",
    officeName: v?.officeName ?? "",
    officePhone: v?.officePhone ?? "",
    officeEmail: v?.officeEmail ?? "",
    portAgent: v?.portAgent ?? "",
    notes: v?.notes ?? "",
  };
}

type Errors = Partial<Record<keyof FormState, string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter the vessel name";
  if (f.imo && !/^\d{7}$/.test(f.imo.trim())) e.imo = "IMO is 7 digits";
  if (f.mmsi && !/^\d{9}$/.test(f.mmsi.trim())) e.mmsi = "MMSI is 9 digits";
  if (f.masterEmail && !EMAIL_RE.test(f.masterEmail.trim())) e.masterEmail = "Invalid email";
  if (f.officeEmail && !EMAIL_RE.test(f.officeEmail.trim())) e.officeEmail = "Invalid email";
  return e;
}

const orNull = (s: string) => (s.trim() ? s.trim() : null);

function toInput(f: FormState): VesselInput {
  return {
    name: f.name.trim().toUpperCase(),
    imo: orNull(f.imo),
    mmsi: orNull(f.mmsi),
    type: f.type,
    destination: f.destination,
    condition: f.condition || null,
    etaSulina: fromLocalInput(f.etaSulina),
    masterName: orNull(f.masterName),
    masterPhone: orNull(f.masterPhone),
    masterEmail: orNull(f.masterEmail),
    officeName: orNull(f.officeName),
    officePhone: orNull(f.officePhone),
    officeEmail: orNull(f.officeEmail),
    portAgent: orNull(f.portAgent),
    notes: orNull(f.notes),
  };
}

/** Only fields the user actually edited — never overwrite a colleague's newer value with a stale snapshot */
function changedFields(before: VesselInput, after: VesselInput): VesselInput {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(after) as (keyof VesselInput)[]) {
    if (after[key] !== before[key]) out[key] = after[key];
  }
  return out as VesselInput;
}

export function VesselFormDialog({
  open,
  onOpenChange,
  vessel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vessel?: VesselView | null;
}) {
  const router = useRouter();
  const { create, update } = useVesselMutations();
  const [form, setForm] = useState<FormState>(() => initial(vessel));
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = !!vessel;
  const snapshot = useRef<VesselInput>(toInput(initial(vessel)));
  const wasOpen = useRef(false);

  // Reset only when the dialog opens: background refreshes of `vessel` must not wipe what is being typed
  useEffect(() => {
    if (open && !wasOpen.current) {
      const start = initial(vessel);
      snapshot.current = toInput(start);
      setForm(start);
      setErrors({});
      setServerError(null);
    }
    wasOpen.current = open;
  }, [open, vessel]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setServerError(null);
    try {
      if (vessel) {
        const patch = changedFields(snapshot.current, toInput(form));
        if (Object.keys(patch).length) await update(vessel.id, patch, "Saved");
        onOpenChange(false);
      } else {
        const saved = await create(toInput(form));
        onOpenChange(false);
        router.push(`/vessels/${saved.id}`);
      }
    } catch (err) {
      const msg = extractAuthError(err);
      setServerError(/imoAlreadyExists/.test(msg) ? "A vessel with this IMO is already on the board." : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${vessel?.name}` : "Add vessel"}</DialogTitle>
          <DialogDescription>
            Checklist items and voyage dates are updated on the vessel card. Every change is logged with your name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name *" error={errors.name} className="sm:col-span-3">
              <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. PRINCESS ABIR" autoFocus />
            </Field>
            <Field label="IMO" error={errors.imo}>
              <TextInput value={form.imo} onChange={(e) => set("imo", e.target.value)} inputMode="numeric" maxLength={7} />
            </Field>
            <Field label="MMSI" error={errors.mmsi} hint="Optional — AIS fills it">
              <TextInput value={form.mmsi} onChange={(e) => set("mmsi", e.target.value)} inputMode="numeric" maxLength={9} />
            </Field>
            <Field label="ETA Sulina">
              <TextInput type="datetime-local" value={form.etaSulina} onChange={(e) => set("etaSulina", e.target.value)} />
            </Field>
            <Field label="Type">
              <SelectInput value={form.type} onChange={(e) => set("type", e.target.value as VesselType)}>
                {VESSEL_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Destination">
              <SelectInput value={form.destination} onChange={(e) => set("destination", e.target.value as Destination)}>
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d}>{DESTINATION_LABEL[d]}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Condition">
              <SelectInput value={form.condition} onChange={(e) => set("condition", e.target.value as VesselCondition | "")}>
                <option value="">—</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
                ))}
              </SelectInput>
            </Field>
          </div>

          <fieldset className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">Master</legend>
            <Field label="Name"><TextInput value={form.masterName} onChange={(e) => set("masterName", e.target.value)} /></Field>
            <Field label="Phone / WhatsApp"><TextInput value={form.masterPhone} onChange={(e) => set("masterPhone", e.target.value)} inputMode="tel" /></Field>
            <Field label="Email" error={errors.masterEmail}><TextInput type="email" value={form.masterEmail} onChange={(e) => set("masterEmail", e.target.value)} /></Field>
          </fieldset>

          <fieldset className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">Owner / operator office</legend>
            <Field label="Company"><TextInput value={form.officeName} onChange={(e) => set("officeName", e.target.value)} /></Field>
            <Field label="Phone"><TextInput value={form.officePhone} onChange={(e) => set("officePhone", e.target.value)} inputMode="tel" /></Field>
            <Field label="Email" error={errors.officeEmail}><TextInput type="email" value={form.officeEmail} onChange={(e) => set("officeEmail", e.target.value)} /></Field>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Port agent at destination"><TextInput value={form.portAgent} onChange={(e) => set("portAgent", e.target.value)} placeholder="Agency, contact person, phone" /></Field>
            <Field label="Notes"><TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={4000} className="min-h-[40px]" /></Field>
          </div>

          {serverError ? (
            <p role="alert" className="rounded-lg border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{serverError}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50">
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              {editing ? "Save changes" : "Add vessel"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
