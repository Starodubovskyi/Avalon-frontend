"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ClipboardCheck, ExternalLink, FileUp, History, Lock, MapPin, MessageCircle, Pencil, Phone, Route, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, isAdmin } from "@/lib/auth/roles";
import { extractAuthError } from "@/lib/api/auth";
import { useVessel, useVesselEvents, useVesselMutations } from "@/lib/vessels/hooks";
import { STAGE_META, daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { marineTrafficUrl } from "@/lib/vessels/geo";
import { fmtRelative } from "@/lib/vessels/format";
import { CONDITION_LABEL, DESTINATION_LABEL, TYPE_LABEL, userName } from "@/lib/vessels/types";
import { ErrorBlock, LoadingBlock, Panel, btn } from "../ui/primitives";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { ChecklistGrid } from "./ChecklistGrid";
import { ContactsPanel } from "./ContactsPanel";
import { HistoryList } from "./HistoryList";
import { PositionPanel } from "./PositionPanel";
import { VesselFormDialog } from "./VesselFormDialog";
import { VesselTypeIcon } from "./VesselTypeIcon";
import { VoyageTimeline } from "./VoyageTimeline";
import { DocumentList } from "../documents/DocumentList";
import { UploadDocumentDialog } from "../documents/UploadDocumentDialog";
import { useDocuments } from "../documents/useDocuments";

function digits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

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
  const meta = STAGE_META[vessel.stage];

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
    <div className="space-y-6">
      <Link href="/vessels" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All vessels
      </Link>

      <header className="relative overflow-hidden rounded-3xl border bg-card shadow-card">
        <div
          aria-hidden
          className={cn("absolute inset-x-0 top-0 h-1.5", unpaid ? "bg-stage-unpaid" : meta.dot)}
        />
        <div aria-hidden className={cn("pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl", unpaid ? "bg-stage-unpaid/10" : meta.soft)} />
        <div className="relative flex flex-wrap items-start justify-between gap-5 p-6">
          <div className="flex min-w-0 items-start gap-4">
            <VesselTypeIcon vessel={vessel} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-extrabold tracking-tight">{vessel.name}</h1>
                <StageBadge stage={vessel.stage} />
                {unpaid ? <UnpaidBadge days={daysSince(vessel.departedAt)} /> : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{vessel.imo ? `IMO ${vessel.imo}` : "IMO not set"}</span>
                {vessel.mmsi ? <span>MMSI {vessel.mmsi}</span> : null}
                <span>{TYPE_LABEL[vessel.type]}{vessel.condition ? ` · ${CONDITION_LABEL[vessel.condition]}` : ""}</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Route className="h-3.5 w-3.5 text-primary" /> Sulina → {DESTINATION_LABEL[vessel.destination]}
                </span>
              </div>
              {!vessel.restricted ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Updated {fmtRelative(vessel.updatedAt)}
                  {vessel.updatedBy ? ` by ${userName(vessel.updatedBy)}` : ""}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!vessel.restricted && vessel.masterPhone ? (
              <>
                <a href={`tel:${vessel.masterPhone.replace(/\s/g, "")}`} className={btn.secondary}>
                  <Phone className="h-4 w-4 text-primary" /> Call master
                </a>
                {digits(vessel.masterPhone).length >= 9 ? (
                  <a href={`https://wa.me/${digits(vessel.masterPhone)}`} target="_blank" rel="noreferrer" className={btn.secondary}>
                    <MessageCircle className="h-4 w-4 text-ok" /> WhatsApp
                  </a>
                ) : null}
              </>
            ) : null}
            <a href={marineTrafficUrl(vessel)} target="_blank" rel="noreferrer" className={btn.secondary}>
              <ExternalLink className="h-4 w-4" /> MarineTraffic
            </a>
            {staff ? (
              <button type="button" onClick={() => setEditOpen(true)} className={btn.primary}>
                <Pencil className="h-4 w-4" /> Edit
              </button>
            ) : null}
            {isAdmin(user) ? (
              <button type="button" onClick={() => void onDelete()} className={cn(btn.secondary, "w-10 px-0 hover:text-bad")} aria-label="Remove vessel">
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        {vessel.restricted ? (
          <p className="relative mx-6 mb-6 flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Read-only view: contacts, payments and the internal checklist are visible to Avalon staff only.
          </p>
        ) : null}
      </header>

      {!vessel.restricted ? (
        <Panel
          title="Preparation checklist"
          description={`${vessel.checklist?.done ?? 0} of ${vessel.checklist?.total ?? 8} done${editable ? " · click an item to switch it" : ""}`}
          icon={<ClipboardCheck className="h-4 w-4" />}
        >
          <ChecklistGrid vessel={vessel} editable={editable} />
        </Panel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Panel title="Voyage" description="ETA → Sulina roads → port → open sea" icon={<Route className="h-4 w-4" />}>
            <VoyageTimeline vessel={vessel} editable={editable} />
          </Panel>
          {!vessel.restricted ? (
            <Panel title="Contacts" icon={<Users className="h-4 w-4" />}>
              <ContactsPanel vessel={vessel} />
              {vessel.pilot || vessel.notes ? (
                <div className="mt-3 space-y-2 rounded-xl bg-muted/70 p-4 text-sm">
                  {vessel.pilot ? <p><span className="font-semibold">Pilot:</span> {vessel.pilot}</p> : null}
                  {vessel.notes ? <p className="whitespace-pre-wrap">{vessel.notes}</p> : null}
                </div>
              ) : null}
            </Panel>
          ) : null}
          {staff ? (
            <Panel
              title="Documents"
              icon={<FileUp className="h-4 w-4" />}
              action={
                <button type="button" onClick={() => setUploadOpen(true)} className={btn.ghost}>
                  <FileUp className="h-4 w-4" /> Upload
                </button>
              }
              bodyClassName="py-1"
            >
              <DocumentList documents={documents ?? []} showVessel={false} emptyText="Attach PDA, crew list, certificates or customs papers for this vessel." />
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Panel title="Position" icon={<MapPin className="h-4 w-4" />}>
            <PositionPanel vessel={vessel} editable={editable} />
          </Panel>
          {staff ? (
            <Panel title="History" description="Every change, signed" icon={<History className="h-4 w-4" />}>
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
