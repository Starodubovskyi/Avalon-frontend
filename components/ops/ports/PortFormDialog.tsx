"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Anchor, Clock, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PortsApi, type PortStatus } from "@/lib/api/ports";
import { extractAuthError } from "@/lib/api/auth";
import { btn, Field, Spinner, TextInput } from "../ui/primitives";
import { PORT_STATUS_META } from "./PortStatusBadge";
import { allTimezones, flagEmoji, isValidTimezone, localTime, PORT_STATUSES, type PortRow } from "./portUtils";

const LOCODE = /^[A-Z]{2}[A-Z0-9]{3}$/;

interface FormState {
  name: string;
  unlocode: string;
  country: string;
  status: PortStatus;
  timezone: string;
  lat: string;
  lng: string;
}

const EMPTY: FormState = { name: "", unlocode: "", country: "", status: "Open", timezone: "UTC", lat: "", lng: "" };

function fromRow(row: PortRow): FormState {
  return {
    name: row.name,
    unlocode: row.unlocode,
    country: row.country,
    status: row.status,
    timezone: row.timezone,
    lat: row.lat === null ? "" : String(row.lat),
    lng: row.lng === null ? "" : String(row.lng),
  };
}

function parseCoord(raw: string, limit: number): number | null | "invalid" {
  if (!raw.trim()) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : "invalid";
}

type Errors = Partial<Record<keyof FormState, string>>;

const invalid = (error?: string) => (error ? "border-bad/60 focus-visible:border-bad focus-visible:ring-bad/15" : "");

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Port name is required";
  if (!LOCODE.test(f.unlocode)) e.unlocode = "2 letters + 3 letters/digits";
  if (f.timezone.trim() && !isValidTimezone(f.timezone.trim())) e.timezone = "Unknown IANA time zone, e.g. Europe/Bucharest";
  const lat = parseCoord(f.lat, 90);
  const lng = parseCoord(f.lng, 180);
  if (lat === "invalid") e.lat = "Between -90 and 90";
  if (lng === "invalid") e.lng = "Between -180 and 180";
  if (!e.lat && !e.lng && (lat === null) !== (lng === null)) e.lng = "Fill both latitude and longitude or neither";
  return e;
}

export function PortFormDialog({
  open,
  onOpenChange,
  port,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  port: PortRow | null;
  onSaved: () => void;
}) {
  const editing = port !== null;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const zones = useMemo(() => (open ? allTimezones() : []), [open]);

  useEffect(() => {
    if (!open) return;
    setForm(port ? fromRow(port) : EMPTY);
    setTouched(false);
    setServerError(null);
  }, [open, port]);

  const errors = validate(form);
  const shown: Errors = touched ? errors : {};
  const tzPreview = localTime(form.timezone.trim() || "UTC", Date.now());
  const flag = flagEmoji(form.country.trim());
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    const lat = parseCoord(form.lat, 90);
    const lng = parseCoord(form.lng, 180);
    const payload = {
      name: form.name.trim(),
      unlocode: form.unlocode,
      country: form.country.trim() || undefined,
      status: form.status,
      timezone: form.timezone.trim() || "UTC",
      lat: lat === "invalid" ? null : lat,
      lng: lng === "invalid" ? null : lng,
    };
    setBusy(true);
    setServerError(null);
    try {
      if (port) await PortsApi.update(port.id, payload);
      else await PortsApi.create(payload);
      toast.success(editing ? `${payload.name} updated` : `${payload.name} added`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = extractAuthError(err);
      setServerError(/alreadyExists/.test(msg) ? "A port with this UN/LOCODE already exists." : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] w-[calc(100%-1.5rem)] max-w-xl gap-0 overflow-y-auto rounded-2xl bg-card p-0 shadow-elevated sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b px-6 pb-4 pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {editing ? <Pencil className="h-5 w-5" /> : <Anchor className="h-5 w-5" />}
          </span>
          <DialogHeader className="min-w-0 space-y-1 pr-6 text-left">
            <DialogTitle className="font-display text-lg font-bold">{port ? `Edit ${port.name}` : "Add port"}</DialogTitle>
            <DialogDescription>Ports appear in vessel destinations and on the fleet map.</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
              <Field label="Port name *" error={shown.name}>
                <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={255} placeholder="Constanța" autoFocus aria-invalid={!!shown.name} className={invalid(shown.name)} />
              </Field>
              <Field label="UN/LOCODE *" error={shown.unlocode}>
                <TextInput
                  value={form.unlocode}
                  onChange={(e) => set("unlocode", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5))}
                  placeholder="ROCND"
                  className={cn("tabular font-mono tracking-widest", invalid(shown.unlocode))}
                  aria-invalid={!!shown.unlocode}
                  autoComplete="off"
                />
              </Field>
            </div>

            <Field label="Country" hint="2-letter ISO code (RO, UA, MD) shows a flag">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-none" aria-hidden>
                  {flag || <Anchor className="h-4 w-4 text-muted-foreground" />}
                </span>
                <TextInput value={form.country} onChange={(e) => set("country", e.target.value)} maxLength={64} placeholder="RO" className="pl-10" />
              </div>
            </Field>

            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-foreground/80">Status</legend>
              <div className="grid grid-cols-3 gap-2">
                {PORT_STATUSES.map((s) => {
                  const meta = PORT_STATUS_META[s];
                  const Icon = meta.icon;
                  return (
                    <label key={s} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="port-status"
                        value={s}
                        checked={form.status === s}
                        onChange={() => set("status", s)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex h-11 items-center justify-center gap-1.5 rounded-xl border bg-card px-2 text-sm font-medium text-muted-foreground transition",
                          "hover:border-primary/40 peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15",
                          form.status === s && meta.chip,
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {meta.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Field
              label="Time zone"
              error={shown.timezone}
              hint={tzPreview ? `Local time now ${tzPreview.time} · ${tzPreview.offset}` : "IANA name, e.g. Europe/Bucharest"}
            >
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <TextInput value={form.timezone} onChange={(e) => set("timezone", e.target.value)} list="port-timezones" placeholder="Europe/Bucharest" className={cn("pl-9", invalid(shown.timezone))} aria-invalid={!!shown.timezone} autoComplete="off" />
              </div>
            </Field>
            <datalist id="port-timezones">
              {zones.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" error={shown.lat}>
                <TextInput value={form.lat} onChange={(e) => set("lat", e.target.value)} inputMode="decimal" placeholder="44.1598" className={cn("tabular", invalid(shown.lat))} aria-invalid={!!shown.lat} />
              </Field>
              <Field label="Longitude" error={shown.lng}>
                <TextInput value={form.lng} onChange={(e) => set("lng", e.target.value)} inputMode="decimal" placeholder="28.6348" className={cn("tabular", invalid(shown.lng))} aria-invalid={!!shown.lng} />
              </Field>
            </div>

            {serverError ? (
              <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{serverError}</p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onOpenChange(false)} className={btn.secondary}>Cancel</button>
            <button type="submit" disabled={busy} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              {editing ? "Save changes" : "Add port"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
