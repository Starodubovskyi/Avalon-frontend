"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, LayoutList, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDuplicateImo, requestError } from "@/lib/requests/api";
import { BoardLinkError, findVesselByImo, useRequestMutations } from "@/lib/requests/hooks";
import { REQUEST_LIMITS, REQUEST_STATUSES, REQUEST_STATUS_META, type AgencyRequest, type RequestStatus } from "@/lib/requests/types";
import type { VesselView } from "@/lib/vessels/types";
import { Spinner, TextArea, btn } from "../ui/primitives";

type Busy = null | "status" | "note" | "board";

/**
 * A board vessel to link instead of creating one:
 * "orphan" — created by us, but the request PATCH failed; "duplicate" — the IMO was already on the board.
 */
type LinkTarget = { vessel: VesselView; reason: "orphan" | "duplicate" };

export function RequestActions({ request: r, onTouch }: { request: AgencyRequest; onTouch?: (id: string) => void }) {
  const { update, addToBoard } = useRequestMutations();
  const [busy, setBusy] = useState<Busy>(null);
  const incoming = r.staffNote ?? "";
  const [note, setNote] = useState(incoming);
  const [savedNote, setSavedNote] = useState(incoming);
  const [target, setTarget] = useState<LinkTarget | null>(null);
  const [duplicateUnknown, setDuplicateUnknown] = useState(false);

  // Adjust during render when the stored reply changes (my save or a colleague's), unless I am typing over it
  if (incoming !== savedNote) {
    setSavedNote(incoming);
    if (note.trim() === savedNote.trim()) setNote(incoming);
  }

  const dirty = note.trim() !== savedNote.trim();

  async function setStatus(status: RequestStatus) {
    if (status === r.status || busy) return;
    onTouch?.(r.id);
    setBusy("status");
    try {
      await update(r.id, { status }, `${r.vesselName}: ${REQUEST_STATUS_META[status].label.toLowerCase()}`);
    } catch {
      /* toast shown by the hook */
    } finally {
      setBusy(null);
    }
  }

  async function saveNote() {
    onTouch?.(r.id);
    setBusy("note");
    try {
      const saved = await update(r.id, { staffNote: note.trim() || null }, "Note saved — the client can see it");
      setNote(saved.staffNote ?? "");
    } catch {
      /* toast shown by the hook */
    } finally {
      setBusy(null);
    }
  }

  async function board() {
    onTouch?.(r.id);
    setBusy("board");
    try {
      await addToBoard(r, target?.vessel);
      setTarget(null);
      setDuplicateUnknown(false);
    } catch (e) {
      if (e instanceof BoardLinkError) {
        setTarget({ vessel: e.vessel, reason: target?.reason ?? "orphan" });
        toast.error(e.message);
      } else if (isDuplicateImo(e)) {
        const existing = await findVesselByImo(r.imo);
        if (existing) setTarget({ vessel: existing, reason: "duplicate" });
        setDuplicateUnknown(!existing);
        toast.error(requestError(e));
      } else {
        toast.error(requestError(e));
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-semibold text-foreground/80">Status</p>
        <div role="radiogroup" aria-label={`Status of ${r.vesselName}`} className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
          {REQUEST_STATUSES.map((s) => {
            const active = r.status === s;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy !== null}
                onClick={() => void setStatus(s)}
                className={cn(
                  "flex min-h-[40px] items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold transition-all disabled:cursor-wait",
                  active ? cn("bg-card shadow-card", REQUEST_STATUS_META[s].text) : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", REQUEST_STATUS_META[s].dot)} aria-hidden /> : null}
                {REQUEST_STATUS_META[s].label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground/80">
          Note for the client
          <span className="tabular font-normal text-muted-foreground">
            {note.length}/{REQUEST_LIMITS.staffNote}
          </span>
        </span>
        <TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={REQUEST_LIMITS.staffNote}
          rows={3}
          placeholder="Terms, PDA total, berth window… The client sees this note."
          className="min-h-[84px]"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => void saveNote()} disabled={!dirty || busy !== null} className={cn(btn.secondary, "px-3")}>
          {busy === "note" ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" aria-hidden />}
          Save note
        </button>
        {r.vesselId ? (
          <Link href={`/vessels/${r.vesselId}`} className={cn(btn.secondary, "px-3 text-ok")}>
            Open vessel <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void board()}
            disabled={busy !== null || r.status === "declined"}
            title={r.status === "declined" ? "Declined requests can't be added — change the status first" : undefined}
            className={cn(btn.primary, "px-3")}
          >
            {busy === "board" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <LayoutList className="h-4 w-4" aria-hidden />}
            {target?.reason === "duplicate" ? "Link existing" : target ? "Retry link" : "Add to board"}
          </button>
        )}
      </div>
      {r.vesselId ? (
        <p className="text-xs text-muted-foreground">On the board — the client can follow the vessel.</p>
      ) : target?.reason === "duplicate" ? (
        <p className="text-xs text-bad">
          This IMO is already on the board —{" "}
          <Link href={`/vessels/${target.vessel.id}`} className="font-semibold underline underline-offset-2">
            open {target.vessel.name}
          </Link>
          , or link the request to it.
        </p>
      ) : target ? (
        <p className="text-xs text-bad">{target.vessel.name} was added to the board; linking the request failed. Retry links it without a duplicate.</p>
      ) : duplicateUnknown ? (
        <p className="text-xs text-bad">This IMO is already on the board — open the existing vessel from the Vessels board.</p>
      ) : (
        <p className="text-xs text-muted-foreground">Add to board creates the vessel from this request and marks it accepted.</p>
      )}
    </div>
  );
}
