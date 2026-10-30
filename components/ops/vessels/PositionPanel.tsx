"use client";

import { useState } from "react";
import { ExternalLink, LocateFixed, Radio } from "lucide-react";
import { useVesselMutations } from "@/lib/vessels/hooks";
import { marineTrafficUrl, resolvePosition } from "@/lib/vessels/geo";
import { isPositionStale } from "@/lib/vessels/status";
import { fmtFull, fmtRelative } from "@/lib/vessels/format";
import type { VesselView } from "@/lib/vessels/types";
import { Field, TextInput } from "../ui/primitives";

export function PositionPanel({ vessel, editable }: { vessel: VesselView; editable: boolean }) {
  const { update } = useVesselMutations();
  const pos = resolvePosition(vessel);
  const stale = !pos.estimated && isPositionStale(vessel);
  const [editing, setEditing] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const la = Number(lat.replace(",", "."));
    const ln = Number(lng.replace(",", "."));
    if (!Number.isFinite(la) || la < -90 || la > 90 || !Number.isFinite(ln) || ln < -180 || ln > 180) {
      setError("Latitude −90…90, longitude −180…180, decimal degrees (e.g. 45.155, 29.79)");
      return;
    }
    setError(null);
    try {
      await update(vessel.id, { lat: la, lng: ln }, "Position saved");
      setEditing(false);
    } catch {
      /* toast shown */
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          {vessel.positionSource === "ais" ? <Radio className="h-4 w-4 text-ok" /> : <LocateFixed className="h-4 w-4 text-muted-foreground" />}
        </span>
        <div className="min-w-0">
          {pos.estimated ? (
            <>
              <p className="font-medium">≈ Estimated position</p>
              <p className="text-xs text-muted-foreground">
                No AIS fix yet — shown at {vessel.stage === "in_port" || vessel.stage === "departed" ? "the destination port" : "Sulina roads"}.
              </p>
            </>
          ) : (
            <>
              <p className="tabular font-medium">
                {pos.lngLat[1].toFixed(4)}°, {pos.lngLat[0].toFixed(4)}°
              </p>
              <p className="text-xs text-muted-foreground">
                {vessel.positionSource === "ais" ? "AIS" : "Set manually"} · {fmtRelative(vessel.positionAt)}
                {vessel.sog !== null ? ` · ${vessel.sog.toFixed(1)} kn` : ""}
                {vessel.cog !== null ? ` · ${Math.round(vessel.cog)}°` : ""}
              </p>
              {stale ? <p className="mt-1 text-xs font-medium text-stage-expected">Position older than 6 h ({fmtFull(vessel.positionAt)})</p> : null}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={marineTrafficUrl(vessel)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-accent"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open in MarineTraffic
        </a>
        {editable && !editing ? (
          <button
            type="button"
            onClick={() => {
              setLat(vessel.lat !== null ? String(vessel.lat) : "");
              setLng(vessel.lng !== null ? String(vessel.lng) : "");
              setEditing(true);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-accent"
          >
            <LocateFixed className="h-3.5 w-3.5" /> Set position
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Latitude"><TextInput value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" placeholder="45.155" /></Field>
            <Field label="Longitude"><TextInput value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" placeholder="29.790" /></Field>
          </div>
          {error ? <p className="text-xs text-bad">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => void save()} className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">Save position</button>
            <button type="button" onClick={() => setEditing(false)} className="h-9 rounded-lg border px-3 text-xs">Cancel</button>
          </div>
          <p className="text-xs text-muted-foreground">Tip: copy coordinates from MarineTraffic. AIS will overwrite them when a fresh fix arrives.</p>
        </div>
      ) : null}
    </div>
  );
}
