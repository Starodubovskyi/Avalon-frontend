"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Languages, Mail, MailWarning, Search, Send, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { displayName } from "@/lib/auth/roles";
import { useVessels } from "@/lib/vessels/hooks";
import { compareVessels } from "@/lib/vessels/status";
import { useVesselLabels } from "@/lib/vessels/i18n";
import {
  EMAIL_TEMPLATES,
  buildEmail,
  mailtoHref,
  suggestedTemplates,
  type EmailDraft,
  type TemplateKey,
} from "@/lib/vessels/emailTemplates";
import { EmptyState, ErrorBlock, Field, LoadingBlock, PageHeader, Panel, TextArea, TextInput, btn } from "../ui/primitives";
import { StageBadge } from "../ui/StageBadge";
import { VesselTypeIcon } from "../vessels/VesselTypeIcon";

/** Ready-to-send agency emails built from the vessel card, opened in the user's own mail app.
 *  Only the chrome is translated: subject and body stay English for masters and agents abroad. */
export function EmailComposer() {
  const t = useTranslations("email");
  const labels = useVesselLabels();
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useVessels("all");
  const [query, setQuery] = useState("");
  const [vesselId, setVesselId] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateKey>("prearrival");
  const [draft, setDraft] = useState<EmailDraft>({ to: "", subject: "", body: "" });

  const vessels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((v) => !v.restricted && (!q || v.name.toLowerCase().includes(q) || (v.imo ?? "").includes(q)))
      .sort(compareVessels);
  }, [data, query]);

  const vessel = (data ?? []).find((v) => v.id === vesselId) ?? vessels[0] ?? null;
  const suggested = vessel ? suggestedTemplates(vessel) : [];
  const sender = displayName(user);

  // Picking a vessel jumps to the template that fits its stage
  useEffect(() => {
    if (vessel) setTemplate(suggestedTemplates(vessel)[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vessel?.id]);

  // Rebuild the draft when the vessel or template changes; edits stay until then
  useEffect(() => {
    if (vessel) setDraft(buildEmail(template, vessel, sender));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vessel?.id, template, sender]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`);
      toast.success(t("copied"));
    } catch {
      toast.error(t("clipboardUnavailable"));
    }
  }

  const tpl = EMAIL_TEMPLATES.find((x) => x.key === template) ?? EMAIL_TEMPLATES[0];
  const tplLabel = t(`templates.${tpl.key}.label`);
  const tplHint = t(`templates.${tpl.key}.hint`);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}
      {data && !data.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState icon={<Mail className="h-7 w-7" />} title={t("emptyTitle")} text={t("emptyText")} />
        </div>
      ) : null}

      {data?.length ? (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Panel title={t("vesselPanel")} description={t("onBoard", { count: vessels.length })} bodyClassName="p-0">
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchAria")} />
              </div>
            </div>
            <ul className="max-h-[560px] overflow-y-auto border-t">
              {vessels.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setVesselId(v.id)}
                    aria-current={vessel?.id === v.id}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border/60 px-4 py-2.5 text-left transition",
                      vessel?.id === v.id ? "bg-primary/10" : "hover:bg-accent/50",
                    )}
                  >
                    <VesselTypeIcon vessel={v} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{v.name}</span>
                      <span className="block text-xs text-muted-foreground">{labels.destination(v.destination)}</span>
                    </span>
                    <StageBadge stage={v.stage} compact />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          {vessel ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("templateAria")}>
                {EMAIL_TEMPLATES.map((x) => (
                  <button
                    key={x.key}
                    type="button"
                    role="tab"
                    aria-selected={template === x.key}
                    onClick={() => setTemplate(x.key)}
                    title={t(`templates.${x.key}.hint`)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-semibold transition",
                      template === x.key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                    )}
                  >
                    {suggested.includes(x.key) ? <Sparkles className="h-3.5 w-3.5" aria-label={t("suggested")} /> : null}
                    {t(`templates.${x.key}.label`)}
                  </button>
                ))}
              </div>

              <Panel
                title={`${tplLabel} · ${vessel.name}`}
                description={t("panelDescription", { hint: tplHint, to: tpl.to })}
                icon={<Mail className="h-4 w-4" />}
              >
                <div className="space-y-4">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden /> {t("englishNote")}
                  </p>
                  {!draft.to ? (
                    <div className="flex items-start gap-2 rounded-xl border border-stage-roads/30 bg-stage-roads/5 px-3 py-2 text-sm">
                      <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-stage-roads" />
                      <span>
                        {t.rich("noEmail", {
                          to: tpl.to,
                          link: (chunks) => (
                            <Link href={`/vessels/${vessel.id}`} className="font-semibold text-primary hover:underline">
                              {chunks}
                            </Link>
                          ),
                        })}
                      </span>
                    </div>
                  ) : null}
                  <Field label={t("to")}>
                    <TextInput type="email" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} placeholder="name@company.com" />
                  </Field>
                  <Field label={t("subject")}>
                    <TextInput value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
                  </Field>
                  <Field label={t("message")}>
                    <TextArea rows={14} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="font-mono text-[13px] leading-relaxed" />
                  </Field>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => setDraft(buildEmail(template, vessel, sender))} className={btn.ghost}>
                      {t("reset")}
                    </button>
                    <button type="button" onClick={() => void copy()} className={btn.secondary}>
                      <Copy className="h-4 w-4" /> {t("copy")}
                    </button>
                    <a href={mailtoHref(draft)} className={cn(btn.primary, !draft.to && "pointer-events-none opacity-50")} aria-disabled={!draft.to}>
                      <Send className="h-4 w-4" /> {t("openMail")}
                    </a>
                  </div>
                </div>
              </Panel>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card shadow-card">
              <EmptyState icon={<Search className="h-7 w-7" />} title={t("noMatchTitle")} text={t("noMatchText")} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
