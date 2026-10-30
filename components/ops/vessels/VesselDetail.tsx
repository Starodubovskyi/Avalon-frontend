"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileUp, Lock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, isAdmin } from "@/lib/auth/roles";
import { extractAuthError } from "@/lib/api/auth";
import { useVessel, useVesselEvents, useVesselMutations } from "@/lib/vessels/hooks";
import { STAGE_META, daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { fmtRelative } from "@/lib/vessels/format";
import { CONDITION_LABEL, DESTINATION_LABEL, TYPE_LABEL, userName } from "@/lib/vessels/types";
import { ErrorBlock, LoadingBlock, Panel } from "../ui/primitives";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { ChecklistRow } from "./ChecklistRow";
import { ContactsPanel } from "./ContactsPanel";
import { HistoryList } from "./HistoryList";
import { PositionPanel } from "./PositionPanel";
import { VesselFormDialog } from "./VesselFormDialog";
import { VoyageTimeline } from "./VoyageTimeline";
import { DocumentList } from "../documents/DocumentList";
import { UploadDocumentDialog } from "../documents/UploadDocumentDialog";
import { useDocuments } from "../documents/useDocuments";

export function VesselDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data: vessel, error, isLoading, mutate } = useVessel(id);
  const { data: events } = useVesselEvents(id);
  const { data: documents } = useDocuments({ vesselId: id });
  const { remove } = useVesselMutations();
  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  if (error && !vessel) return <ErrorBlock error={error} onRetry={() => void mutate()} />;
  if (!vessel) return <LoadingBlock label={isLoading ? "Loading vessel…" : "Vessel not found"} />;

  const unpaid = isUnpaidAfterDeparture(vessel);
  const editable = staff && !vessel.restricted;

  async function onDelete() {
    if (!vessel) return;
    if (!window.confirm(`Remove ${vessel.name} from the board? The history is kept.`)) return;
    try {
      await remove(vessel);
      router.push("/vessels");
    } catch (e) {
      toast.error(extractAuthError(e));
    }
  }

  return (
    <div className="space-y-5">
      <Link href="/vessels" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All vessels
      </Link>

      <header
        className={cn(
          "rounded-xl border border-l-4 bg-card p-5 shadow-sm",
          unpaid ? "border-l-stage-unpaid" : STAGE_META[vessel.stage].border,
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{vessel.name}</h1>
              <StageBadge stage={vessel.stage} />
              {unpaid ? <UnpaidBadge days={daysSince(vessel.departedAt)} /> : null}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {vessel.imo ? `IMO ${vessel.imo}` : "IMO not set"}
              {vessel.mmsi ? ` · MMSI ${vessel.mmsi}` : ""} · {TYPE_LABEL[vessel.type]}
              {vessel.condition ? ` · ${CONDITION_LABEL[vessel.condition]}` : ""} · Sulina → {DESTINATION_LABEL[vessel.destination]}
            </p>
            {!vessel.restricted ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Updated {fmtRelative(vessel.updatedAt)}
                {vessel.updatedBy ? ` by ${userName(vessel.updatedBy)}` : ""}
              </p>
            ) : null}
          </div>
          {staff ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditOpen(true)} className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium hover:bg-accent">
                <Pencil className="h-4 w-4" /> Edit
              </button>
              {isAdmin(user) ? (
                <button type="button" onClick={() => void onDelete()} className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground hover:bg-bad/10 hover:text-bad" aria-label="Remove vessel">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {vessel.restricted ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Read-only view: contacts, payments and the internal checklist are visible to Avalon staff only.
          </p>
        ) : (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Checklist {vessel.checklist ? `· ${vessel.checklist.done}/${vessel.checklist.total} done` : ""}
              {editable ? " · click an item to switch it" : ""}
            </p>
            <ChecklistRow vessel={vessel} editable={editable} size="md" wrap />
          </div>
        )}
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Panel title="Voyage">
            <VoyageTimeline vessel={vessel} editable={editable} />
          </Panel>
          {!vessel.restricted ? (
            <Panel title="Contacts">
              <ContactsPanel vessel={vessel} />
              {vessel.pilot || vessel.notes ? (
                <div className="mt-3 space-y-2 rounded-lg bg-muted/60 p-3 text-sm">
                  {vessel.pilot ? <p><span className="font-medium">Pilot:</span> {vessel.pilot}</p> : null}
                  {vessel.notes ? <p className="whitespace-pre-wrap">{vessel.notes}</p> : null}
                </div>
              ) : null}
            </Panel>
          ) : null}
          {staff ? (
            <Panel
              title="Documents"
              action={
                <button type="button" onClick={() => setUploadOpen(true)} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10">
                  <FileUp className="h-3.5 w-3.5" /> Upload
                </button>
              }
              bodyClassName="py-1"
            >
              <DocumentList documents={documents ?? []} showVessel={false} emptyText="Attach PDA, crew list, certificates or customs papers for this vessel." />
            </Panel>
          ) : null}
        </div>

        <div className="space-y-5">
          <Panel title="Position">
            <PositionPanel vessel={vessel} editable={editable} />
          </Panel>
          {staff ? (
            <Panel title="History">
              {events ? <HistoryList events={events} /> : <LoadingBlock label="Loading history…" />}
            </Panel>
          ) : null}
        </div>
      </div>

      {staff ? <VesselFormDialog open={editOpen} onOpenChange={setEditOpen} vessel={vessel} /> : null}
      {staff ? <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} vesselId={vessel.id} /> : null}
    </div>
  );
}
