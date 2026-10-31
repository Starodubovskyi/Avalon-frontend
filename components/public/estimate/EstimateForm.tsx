"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, SelectInput, TextInput, btn } from "@/components/ops/ui/primitives";
import { TYPE_ICON } from "@/components/ops/vessels/VesselTypeIcon";
import { PDA_LIMITS } from "@/lib/public/pdaTariffs";
import {
  CONDITIONS,
  CONDITION_LABEL,
  DESTINATIONS,
  DESTINATION_LABEL,
  TYPE_LABEL,
  VESSEL_TYPES,
  type Destination,
  type VesselCondition,
  type VesselType,
} from "@/lib/vessels/types";

export interface EstimateDraft {
  port: Destination;
  vesselType: VesselType;
  condition: VesselCondition;
  gt: string;
  loa: string;
  days: string;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  render: (v: T) => React.ReactNode;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-1 rounded-xl bg-muted p-1", options.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            "flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold transition-all",
            value === o ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {render(o)}
        </button>
      ))}
    </div>
  );
}

function RangeField({
  label,
  unit,
  value,
  limits,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  limits: { min: number; max: number; step: number };
  onChange: (v: string) => void;
}) {
  const n = Number(value);
  const outOfRange = value !== "" && (!Number.isFinite(n) || n < limits.min || n > limits.max);
  return (
    <Field
      label={label}
      error={outOfRange ? `Between ${limits.min.toLocaleString("en-GB")} and ${limits.max.toLocaleString("en-GB")} ${unit}` : undefined}
    >
      <div className="relative">
        <TextInput
          type="number"
          inputMode="numeric"
          min={limits.min}
          max={limits.max}
          step={limits.step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="tabular pr-12"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-semibold text-muted-foreground">{unit}</span>
      </div>
      <input
        type="range"
        min={limits.min}
        max={limits.max}
        step={limits.step}
        value={Number.isFinite(n) ? Math.min(limits.max, Math.max(limits.min, n)) : limits.min}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} slider`}
        className="mt-1 h-6 w-full cursor-pointer accent-primary"
      />
    </Field>
  );
}

export function EstimateForm({ draft, onChange }: { draft: EstimateDraft; onChange: (patch: Partial<EstimateDraft>) => void }) {
  const days = Number(draft.days) || PDA_LIMITS.days.min;
  const setDays = (d: number) => onChange({ days: String(Math.min(PDA_LIMITS.days.max, Math.max(PDA_LIMITS.days.min, d))) });

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Vessel and call details">
      <Field label="Port of call">
        <SelectInput value={draft.port} onChange={(e) => onChange({ port: e.target.value as Destination })}>
          {DESTINATIONS.map((d) => (
            <option key={d} value={d}>
              {DESTINATION_LABEL[d]}
            </option>
          ))}
        </SelectInput>
      </Field>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground/80">Vessel type</p>
        <Segmented
          label="Vessel type"
          value={draft.vesselType}
          options={VESSEL_TYPES}
          onChange={(vesselType) => onChange({ vesselType })}
          render={(t) => {
            const Icon = TYPE_ICON[t];
            return (
              <>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{t === "general_cargo" ? "Cargo" : TYPE_LABEL[t]}</span>
              </>
            );
          }}
        />
      </div>

      <RangeField label="Gross tonnage" unit="GT" value={draft.gt} limits={PDA_LIMITS.gt} onChange={(gt) => onChange({ gt })} />
      <RangeField label="Length overall" unit="m" value={draft.loa} limits={PDA_LIMITS.loa} onChange={(loa) => onChange({ loa })} />

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground/80">Days alongside</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDays(days - 1)} className={cn(btn.secondary, "w-11 px-0")} aria-label="One day less" disabled={days <= PDA_LIMITS.days.min}>
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <TextInput
            type="number"
            inputMode="numeric"
            min={PDA_LIMITS.days.min}
            max={PDA_LIMITS.days.max}
            value={draft.days}
            onChange={(e) => onChange({ days: e.target.value })}
            className="tabular text-center"
            aria-label="Days alongside"
          />
          <button type="button" onClick={() => setDays(days + 1)} className={cn(btn.secondary, "w-11 px-0")} aria-label="One day more" disabled={days >= PDA_LIMITS.days.max}>
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground/80">Condition</p>
        <Segmented
          label="Condition"
          value={draft.condition}
          options={CONDITIONS}
          onChange={(condition) => onChange({ condition })}
          render={(c) => CONDITION_LABEL[c]}
        />
      </div>
    </form>
  );
}
