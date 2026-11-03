import { Check, FileText, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_PDA_INPUT, PDA_GROUP_LABEL, estimatePda, fmtEur, type PdaGroup } from "@/lib/public/pdaTariffs";
import { DESTINATION_LABEL, TYPE_LABEL } from "@/lib/vessels/types";

/** Computed with the same model as /estimate, so the numbers match the calculator */
const SAMPLE = estimatePda(DEFAULT_PDA_INPUT);
const GROUPS = (Object.keys(PDA_GROUP_LABEL) as PdaGroup[]).map((g) => ({
  group: g,
  label: PDA_GROUP_LABEL[g],
  amount: SAMPLE.lines.filter((l) => l.group === g).reduce((sum, l) => sum + l.amount, 0),
}));
const MAX = Math.max(...GROUPS.map((g) => g.amount));
/** literal width steps for the bars (Tailwind needs static class names) */
const WIDTHS = ["w-[12%]", "w-[25%]", "w-[37%]", "w-[50%]", "w-[62%]", "w-[75%]", "w-[87%]", "w-full"];

function barWidth(amount: number): string {
  return WIDTHS[Math.max(0, Math.min(WIDTHS.length - 1, Math.round((amount / MAX) * WIDTHS.length) - 1))];
}

export function PdaVisual() {
  const { input } = SAMPLE;
  return (
    <div className="rounded-xl border bg-background/60 p-3.5">
      <p className="text-[11px] text-muted-foreground">
        {DESTINATION_LABEL[input.port]} · {TYPE_LABEL[input.vesselType]} · {input.gt.toLocaleString("en-GB")} GT · {input.days} days
      </p>
      <ul className="mt-3 space-y-2">
        {GROUPS.map((g) => (
          <li key={g.group}>
            <div className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="truncate text-foreground/80">{g.label}</span>
              <span className="tabular font-semibold">{fmtEur(g.amount)}</span>
            </div>
            <span className="mt-1 block h-1.5 rounded-full bg-muted">
              <span className={cn("block h-full rounded-full bg-gradient-to-r from-primary/60 to-primary", barWidth(g.amount))} />
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between border-t pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Indicative total</span>
        <span className="tabular font-display text-xl font-extrabold">{fmtEur(SAMPLE.total)}</span>
      </div>
    </div>
  );
}

const REQUEST_STEPS = [
  { label: "Received", done: true },
  { label: "PDA quoted", done: true },
  { label: "Confirmed", done: false },
];

export function RequestVisual() {
  return (
    <div className="rounded-xl border bg-background/60 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Agency request</p>
          <p className="mt-0.5 truncate text-[13px] font-bold">KARANFIL → Brăila</p>
          <p className="truncate text-[11px] text-muted-foreground">Grain, 4,800 t · ETA Sulina Thu</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">New</span>
      </div>
      <ol className="mt-4 flex items-center">
        {REQUEST_STEPS.map((s, i) => (
          <li key={s.label} className={cn("flex items-center", i < REQUEST_STEPS.length - 1 && "flex-1")}>
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  s.done ? "border-ok bg-ok text-white" : "border-primary bg-card text-primary",
                )}
              >
                {s.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse" />}
              </span>
              <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">{s.label}</span>
            </span>
            {i < REQUEST_STEPS.length - 1 ? <span className={cn("mx-1 mb-4 h-0.5 flex-1 rounded-full", s.done ? "bg-ok/60" : "bg-border")} /> : null}
          </li>
        ))}
      </ol>
      <ul className="mt-4 divide-y border-t">
        {EARLIER.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-2 py-2 text-[11px] last:pb-0">
            <span className="min-w-0 truncate font-semibold">{r.name}</span>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", r.tone)}>{r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EARLIER = [
  { name: "UGAH CONFIDENCE → Izmail", status: "PDA quoted", tone: "bg-primary/10 text-primary" },
  { name: "AZOV COAST → Tulcea", status: "Confirmed", tone: "bg-ok/10 text-ok" },
];

const MESSAGES: { from: "ops" | "owner"; who: string; text: string; time: string; file?: string }[] = [
  { from: "ops", who: "Irina · Avalon ops", text: "KEREMCAN anchored at the Sulina roads. Pilot ordered for 05:00.", time: "21:14" },
  { from: "owner", who: "Owner's office", text: "Great, thanks. Can you share the updated PDA?", time: "21:16" },
  { from: "ops", who: "Irina · Avalon ops", text: "Sent — it's also on the board under Documents.", time: "21:18", file: "PDA · KEREMCAN.pdf" },
];

export function ChatVisual() {
  return (
    <div className="flex h-full flex-col gap-2.5 rounded-xl border bg-background/60 p-3.5">
      {MESSAGES.map((m) => {
        const ops = m.from === "ops";
        return (
          <div key={m.time} className={cn("flex items-end gap-2", !ops && "flex-row-reverse")}>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                ops ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70",
              )}
              aria-hidden
            >
              {ops ? "IM" : "OW"}
            </span>
            <div className={cn("max-w-[78%] rounded-2xl px-3 py-2", ops ? "rounded-bl-md bg-card shadow-card" : "rounded-br-md bg-primary text-primary-foreground")}>
              <p className={cn("text-[10px] font-semibold", ops ? "text-muted-foreground" : "text-primary-foreground/75")}>
                {m.who} · {m.time}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug">{m.text}</p>
              {m.file ? (
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1 text-[11px] font-medium">
                  <FileText className="h-3.5 w-3.5 text-primary" aria-hidden /> {m.file}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-1 pl-9" aria-hidden>
        {["[animation-delay:0ms]", "[animation-delay:150ms]", "[animation-delay:300ms]"].map((d) => (
          <span key={d} className={cn("h-1.5 w-1.5 rounded-full bg-muted-foreground/50 motion-safe:animate-bounce", d)} />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-xl border bg-card py-1.5 pl-3 pr-1.5 text-[12px] text-muted-foreground shadow-card" aria-hidden>
        Write to the Avalon team…
        <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Send className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
