"use client";

import { useState } from "react";
import { ExternalLink, LocateFixed, Radio } from "lucide-react";
import { useVesselMutations } from "@/lib/vessels/hooks";
import { marineTrafficUrl, resolvePosition } from "@/lib/vessels/geo";
import { isPositionStale, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { fmtFull, fmtRelative } from "@/lib/vessels/format";
import type { VesselView } from "@/lib/vessels/types";
import { Field, TextInput } from "../ui/primitives";

const PIN_COLOR: Record<VesselView["stage"], string> = {
  expected: "e8a317",
  at_roads: "10a3b8",
  in_port: "2f6fd8",
  departed: "7c8796",
};

function staticMapUrl(vessel: VesselView, [lng, lat]: [number, number], estimated: boolean): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  if (!token) return null;
  const color = isUnpaidAfterDeparture(vessel) ? "d61f8a" : PIN_COLOR[vessel.stage];
  const zoom = estimated ? 8.5 : 10;
  const pin = `pin-l-harbor+${color}(${lng.toFixed(4)},${lat.toFixed(4)})`;
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${pin}/${lng.toFixed(4)},${lat.toFixed(4)},${zoom},0/640x280@2x?access_token=${encodeURIComponent(token)}`;
}

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

  const preview = staticMapUrl(vessel, pos.lngLat, pos.estimated);

  return (
    <div className="space-y-3 text-sm">
      {preview ? (
        <a
          href={marineTrafficUrl(vessel)}
          target="_blank"
          rel="noreferrer"
          className="group relative block overflow-hidden rounded-xl border"
          title="Open in MarineTraffic"
        >
          {/* external static image (Mapbox Static API); next/image would need a remote domain allowlist */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={`Map around ${vessel.name}`}
            loading="lazy"
            className="aspect-[16/7] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          {pos.estimated ? (
            <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
              ≈ estimated
            </span>
          ) : null}
        </a>
      ) : null}
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
