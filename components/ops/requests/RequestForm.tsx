"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Building2, Send, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { requestError, requestFieldErrors, type FieldErrors } from "@/lib/requests/api";
import { useRequestMutations } from "@/lib/requests/hooks";
import { toCreateDto, validateRequestForm, type RequestFormState } from "@/lib/requests/form";
import { REQUEST_LIMITS, type AgencyRequest } from "@/lib/requests/types";
import { DESTINATIONS, DESTINATION_LABEL, TYPE_LABEL, VESSEL_TYPES, type Destination, type VesselType } from "@/lib/vessels/types";
import { Field, SelectInput, Spinner, TextArea, TextInput, btn } from "../ui/primitives";

function Group({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function RequestForm({ initial, onSubmitted }: { initial: RequestFormState; onSubmitted: (saved: AgencyRequest) => void }) {
  const { create } = useRequestMutations();
  const [form, setForm] = useState<RequestFormState>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof RequestFormState>(key: K, value: RequestFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const found = validateRequestForm(form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setFormError("Some fields need attention");
      return;
    }
    setBusy(true);
    try {
      const saved = await create(toCreateDto(form));
      onSubmitted(saved);
    } catch (err) {
      const fields = requestFieldErrors(err);
      if (fields) setErrors(fields);
      setFormError(requestError(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <Group icon={<Building2 className="h-4 w-4" aria-hidden />} title="Your company">
        <Field label="Company *" error={errors.company}>
          <TextInput value={form.company} onChange={(e) => set("company", e.target.value)} maxLength={REQUEST_LIMITS.company} autoComplete="organization" required />
        </Field>
        <Field label="Contact name *" error={errors.contactName}>
          <TextInput value={form.contactName} onChange={(e) => set("contactName", e.target.value)} maxLength={REQUEST_LIMITS.contactName} autoComplete="name" required />
        </Field>
        <Field label="Email *" error={errors.email}>
          <TextInput type="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={REQUEST_LIMITS.email} autoComplete="email" required />
        </Field>
        <Field label="Phone / WhatsApp" error={errors.phone}>
          <TextInput type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={REQUEST_LIMITS.phone} autoComplete="tel" />
        </Field>
      </Group>

      <Group icon={<Ship className="h-4 w-4" aria-hidden />} title="Vessel & call">
        <Field label="Vessel name *" error={errors.vesselName}>
          <TextInput
            value={form.vesselName}
            onChange={(e) => set("vesselName", e.target.value.toUpperCase())}
            maxLength={REQUEST_LIMITS.vesselName}
            placeholder="MV DANUBE STAR"
            autoCapitalize="characters"
            required
          />
        </Field>
        <Field label="IMO" error={errors.imo} hint="7 digits">
          <TextInput
            value={form.imo}
            onChange={(e) => set("imo", e.target.value.replace(/\D/g, "").slice(0, 7))}
            inputMode="numeric"
            placeholder="9123456"
            className="tabular"
          />
        </Field>
        <Field label="Vessel type *" error={errors.vesselType}>
          <SelectInput value={form.vesselType} onChange={(e) => set("vesselType", e.target.value as VesselType)}>
            {VESSEL_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Port of call *" error={errors.destination}>
          <SelectInput value={form.destination} onChange={(e) => set("destination", e.target.value as Destination)}>
            {DESTINATIONS.map((d) => (
              <option key={d} value={d}>
                {DESTINATION_LABEL[d]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="ETA Sulina" error={errors.eta} hint="Your local time">
          <TextInput type="datetime-local" value={form.eta} onChange={(e) => set("eta", e.target.value)} />
        </Field>
        <Field label="Cargo" error={errors.cargo}>
          <TextInput value={form.cargo} onChange={(e) => set("cargo", e.target.value)} maxLength={REQUEST_LIMITS.cargo} placeholder="e.g. 4,500 t wheat" />
        </Field>
      </Group>

      <Field label="Notes for the agent" error={errors.notes} hint={`${form.notes.length} / ${REQUEST_LIMITS.notes}`}>
        <TextArea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          maxLength={REQUEST_LIMITS.notes}
          rows={4}
          placeholder="Laycan, charterer, special requirements, husbandry needs…"
        />
      </Field>

      {formError ? (
        <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3.5 py-2.5 text-sm text-bad">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">* Required. Only Avalon staff see your request.</p>
        <button type="submit" disabled={busy} className={cn(btn.primary, "h-11 w-full px-6 sm:w-auto")}>
          {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <Send className="h-4 w-4" aria-hidden />}
          {busy ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
