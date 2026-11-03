"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PointKind } from "@/lib/points/team-points";
import { Spinner, btn } from "../ui/primitives";
import { POINT_KIND_CLASS, POINT_KIND_ICON } from "./PointKindIcon";
import { LogoError, prepareLogo } from "./logoImage";

/** Round logo / photo picker on top of the point form; resized in the browser before it is sent */
export function LogoUploader({
  value,
  kind,
  onChange,
}: {
  value: string | null;
  kind: PointKind;
  onChange: (logo: string | null) => void;
}) {
  const t = useTranslations("points");
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon = POINT_KIND_ICON[kind];

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await prepareLogo(file));
    } catch (e) {
      setError(t(`logo.errors.${e instanceof LogoError ? e.code : "unreadable"}`));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label={value ? t("logo.changeAria") : t("logo.addAria")}
        className={cn(
          "group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
          value ? cn("bg-white ring-2", POINT_KIND_CLASS[kind].ring) : cn("text-white", POINT_KIND_CLASS[kind].gradient, POINT_KIND_CLASS[kind].glow),
        )}
      >
        {value ? (
          <Image src={value} alt={t("logo.preview")} width={80} height={80} unoptimized className="h-full w-full object-contain p-2" />
        ) : (
          <Icon className="h-8 w-8 opacity-90" strokeWidth={2} aria-hidden />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/55 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <ImagePlus className="h-6 w-6" aria-hidden />
        </span>
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/55">
            <Spinner className="h-5 w-5 text-white" />
          </span>
        ) : null}
      </button>
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-semibold">{t("logo.title")}</p>
        <p className="text-xs text-muted-foreground">{t("logo.hint")}</p>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className={cn(btn.secondary, "h-8 px-3 text-xs")}>
            <ImagePlus className="h-3.5 w-3.5" /> {value ? t("logo.change") : t("logo.upload")}
          </button>
          {value ? (
            <button type="button" onClick={() => onChange(null)} disabled={busy} className={cn(btn.ghost, "h-8 px-2.5 text-xs hover:text-bad")}>
              <Trash2 className="h-3.5 w-3.5" /> {t("logo.remove")}
            </button>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-xs text-bad">
            {error}
          </p>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        data-testid="logo-input"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </div>
  );
}
