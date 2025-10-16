"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, X, Star } from "lucide-react";
import { useLiquidStore } from "./state";
import { alpha2FromVessel, flagImgUrl } from "./utils";
import { useRouter } from "next/navigation";

export function LiquidPreviewDrawer() {
  const router = useRouter();
  const {
    isPreviewOpen,
    previewId,
    closePreview,
    filtered,
    toggleWatch,
    watchlist,
    setSelectedId,
  } = useLiquidStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const vessel = useMemo(
    () => filtered.find((v) => String(v.id) === String(previewId)),
    [filtered, previewId]
  );
  const inWatch = vessel ? watchlist.has(String(vessel.id)) : false;

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/30 transition-opacity ${
          isPreviewOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closePreview}
      />
      <aside
        className={`fixed right-0 top-0 z-[71] h-full w-[380px] max-w-[85vw] transform border-l border-neutral-200 bg-white shadow-xl transition-transform dark:border-neutral-800 dark:bg-neutral-900 ${
          isPreviewOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isPreviewOpen}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold">Vessel Preview</span>
          </div>
          <button
            onClick={closePreview}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {vessel ? (
          <div className="space-y-4 px-4 py-4">
            <div className="flex items-start gap-3">
              <img
                src={vessel.photoUrl}
                alt={vessel.name}
                className="h-16 w-24 flex-shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.display = "none")
                }
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold">{vessel.name}</h2>
                  {(() => {
                    const a2 = alpha2FromVessel(vessel);
                    const src = flagImgUrl(a2);
                    return src ? (
                      <img
                        src={src}
                        alt={vessel.flag || a2?.toUpperCase() || "flag"}
                        className="h-[14px] w-[18px] rounded-[2px] ring-1 ring-black/10"
                      />
                    ) : null;
                  })()}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {vessel.vesselType} • IMO {vessel.imo}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Cargo
              </div>
              <div className="mt-1 text-sm">
                {vessel.cargo?.type ?? "—"}
                {vessel.cargo?.grade ? ` • ${vessel.cargo.grade}` : ""}
                {typeof vessel.cargo?.qty === "number"
                  ? ` • ${vessel.cargo.qty.toLocaleString()}${
                      vessel.cargo.unit ? " " + vessel.cargo.unit : ""
                    }`
                  : ""}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CardRow
                title="Route"
                value={`${vessel.currentPort ?? "—"} → ${
                  vessel.destinationPort ?? vessel.reportedDestination ?? "—"
                }`}
              />
              <CardRow
                title="ETA"
                value={
                  vessel.reportedETA
                    ? new Date(vessel.reportedETA).toLocaleString(undefined, {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) +
                      (typeof vessel.etaConfH === "number"
                        ? `  ±${vessel.etaConfH}h`
                        : "")
                    : "—"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CardRow title="Zone" value={vessel.zone ?? "—"} />
              <CardRow title="Operation" value={vessel.operation ?? "—"} />
              <CardRow
                title="Speed"
                value={
                  typeof vessel.speed === "number"
                    ? `${vessel.speed.toFixed(1)} kn`
                    : "—"
                }
              />
              <CardRow
                title="Draft"
                value={
                  vessel.draft?.current && vessel.draft?.max
                    ? `${vessel.draft.current.toFixed(
                        1
                      )}/${vessel.draft.max.toFixed(1)} m`
                    : "—"
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedId(String(vessel.id));
                }}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                Show on map
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem(
                      `vessel:${vessel.id}`,
                      JSON.stringify(vessel)
                    );
                  } catch {}
                  router.push(`/vessels/${vessel.id}`);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open profile
              </button>
              <button
                onClick={() => toggleWatch(String(vessel.id))}
                className={`ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm ${
                  inWatch
                    ? "bg-yellow-500 text-white"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <Star
                  className="h-4 w-4"
                  fill={inWatch ? "currentColor" : "none"}
                  strokeWidth={inWatch ? 1 : 2}
                />
                {inWatch ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-neutral-500 dark:text-neutral-400">
            Select a vessel to preview.
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}

function CardRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
        {title}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
