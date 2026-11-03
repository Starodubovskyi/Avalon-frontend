"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVessels } from "@/lib/vessels/hooks";
import { STAGE_META } from "@/lib/vessels/status";
import { DESTINATION_LABEL } from "@/lib/vessels/types";

/** Jump to any vessel by name or IMO from every page; Ctrl/⌘ K focuses it */
export function QuickSearch() {
  const t = useTranslations("shell");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data } = useVessels("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mac, setMac] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return (data ?? []).filter((v) => v.name.toLowerCase().includes(s) || (v.imo ?? "").includes(s)).slice(0, 6);
  }, [data, q]);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const reset = () => {
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={boxRef} className="relative hidden w-full max-w-md md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            router.push(`/vessels/${results[0].id}`);
            reset();
          }
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchLabel")}
        className="peer h-9 w-full rounded-xl border border-border bg-muted/70 pl-9 pr-14 text-sm outline-none transition placeholder:text-muted-foreground hover:border-border-strong focus:border-primary/40 focus:bg-card focus:shadow-raised focus:ring-4 focus:ring-primary/10"
      />
      <kbd
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border bg-card px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-foreground shadow-card peer-focus:opacity-0 lg:flex"
      >
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
      {open && q.trim() ? (
        <div className="animate-pop absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border bg-popover p-1 shadow-elevated">
          {results.length ? (
            <ul>
              {results.map((v) => (
                <li key={v.id}>
                  <Link href={`/vessels/${v.id}`} onClick={reset} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", STAGE_META[v.stage].dot)} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{v.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {tc(`stage.${v.stage}`)} → {DESTINATION_LABEL[v.destination]}
                      </span>
                    </span>
                    {v.imo ? <span className="tabular shrink-0 text-[11px] text-muted-foreground">IMO {v.imo}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">{t("searchEmpty")}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
