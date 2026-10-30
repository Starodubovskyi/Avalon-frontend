"use client";

import { Anchor, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, Spinner } from "../ui/primitives";
import { PortStatusBadge } from "./PortStatusBadge";
import { countryName, flagEmoji, fmtCoord, localTime, type PortRow } from "./portUtils";

interface PortListProps {
  rows: PortRow[];
  now: number;
  admin: boolean;
  busyId: string | null;
  onEdit: (row: PortRow) => void;
  onDelete: (row: PortRow) => void;
}

function FlagTile({ country, className }: { country: string; className?: string }) {
  const flag = flagEmoji(country);
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-primary/10 to-primary/[0.03] text-xl leading-none text-primary",
        className,
      )}
      aria-hidden
    >
      {flag || <Anchor className="h-[18px] w-[18px]" />}
    </span>
  );
}

function Locode({ code }: { code: string }) {
  return (
    <span className="tabular inline-flex rounded-md border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-foreground/80">
      {code || "—"}
    </span>
  );
}

function Country({ code }: { code: string }) {
  if (!code) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="truncate">{countryName(code)}</span>
      {code.length === 2 ? <span className="text-xs text-muted-foreground">{code.toUpperCase()}</span> : null}
    </span>
  );
}

function LocalTime({ tz, now }: { tz: string; now: number }) {
  const t = localTime(tz, now);
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0">
        <span className="tabular block text-sm font-semibold">
          {t ? t.time : "—"}
          {t ? <span className="ml-1.5 text-xs font-medium text-muted-foreground">{t.offset}</span> : null}
        </span>
        <span className="block truncate text-xs text-muted-foreground" title={tz}>
          {t ? tz : `Unknown zone “${tz}”`}
        </span>
      </span>
    </span>
  );
}

function Coords({ row }: { row: PortRow }) {
  if (row.lat === null || row.lng === null) {
    return <span className="text-xs text-muted-foreground">No coordinates</span>;
  }
  return (
    <span className="tabular inline-flex items-center gap-1.5 text-xs text-foreground/80">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      {fmtCoord(row.lat, "lat")}, {fmtCoord(row.lng, "lng")}
    </span>
  );
}

function RowActions({ row, busy, onEdit, onDelete, reveal }: { row: PortRow; busy: boolean; onEdit: () => void; onDelete: () => void; reveal?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1",
        reveal && "opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100",
      )}
    >
      {busy ? <Spinner className="h-4 w-4" /> : null}
      <button type="button" onClick={onEdit} disabled={busy} className={btn.icon} aria-label={`Edit ${row.name}`}>
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className={cn(btn.icon, "hover:bg-bad/10 hover:text-bad")}
        aria-label={`Delete ${row.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PortList({ rows, now, admin, busyId, onEdit, onDelete }: PortListProps) {
  return (
    <>
      {/* ≥ md: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="py-3 pl-5 pr-3 font-semibold">Port</th>
              <th scope="col" className="px-3 py-3 font-semibold">Country</th>
              <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              <th scope="col" className="px-3 py-3 font-semibold">Local time</th>
              <th scope="col" className="hidden px-3 py-3 font-semibold xl:table-cell">Coordinates</th>
              {admin ? <th scope="col" className="py-3 pl-3 pr-5"><span className="sr-only">Actions</span></th> : null}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id} className="group transition-colors hover:bg-accent/40">
                <td className="py-3 pl-5 pr-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FlagTile country={row.country} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{row.name}</p>
                      <div className="mt-0.5"><Locode code={row.unlocode} /></div>
                    </div>
                  </div>
                </td>
                <td className="max-w-[200px] px-3 py-3"><Country code={row.country} /></td>
                <td className="px-3 py-3"><PortStatusBadge status={row.status} /></td>
                <td className="max-w-[220px] px-3 py-3"><LocalTime tz={row.timezone} now={now} /></td>
                <td className="hidden px-3 py-3 xl:table-cell"><Coords row={row} /></td>
                {admin ? (
                  <td className="py-3 pl-3 pr-5">
                    <RowActions row={row} busy={busyId === row.id} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} reveal />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* < md: cards */}
      <ul className="divide-y md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start gap-3">
              <FlagTile country={row.country} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{row.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <Locode code={row.unlocode} />
                  <span className="min-w-0 truncate text-muted-foreground"><Country code={row.country} /></span>
                </div>
              </div>
              <PortStatusBadge status={row.status} className="shrink-0" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-muted/50 px-3 py-2.5">
              <LocalTime tz={row.timezone} now={now} />
              <Coords row={row} />
            </div>
            {admin ? <RowActions row={row} busy={busyId === row.id} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} /> : null}
          </li>
        ))}
      </ul>
    </>
  );
}
