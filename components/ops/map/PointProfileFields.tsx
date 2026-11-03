"use client";

import { Globe2, Lock } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { POINT_VISIBILITIES, pointTitle, type PointVisibility, type TeamPoint } from "@/lib/points/team-points";
import { DESCRIPTION_MAX } from "@/lib/points/limits";
import { Field, SelectInput, TextArea, TextInput } from "../ui/primitives";
import type { PointFormState } from "./pointForm";

const VIS_ICON: Record<PointVisibility, typeof Globe2> = { public: Globe2, team: Lock };

/** Visibility, Parent company (branches), Description, Website */
export function PointProfileFields({
  form,
  set,
  pointId,
  headOffices,
}: {
  form: PointFormState;
  set: <K extends keyof PointFormState>(k: K, v: PointFormState[K]) => void;
  pointId: string | null;
  headOffices: TeamPoint[];
}) {
  const t = useTranslations("points");
  const format = useFormatter();
  const parents = headOffices.filter((p) => p.id !== pointId);
  return (
    <>
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-foreground/80">{t("form.visibility")}</span>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label={t("form.visibility")}>
          {POINT_VISIBILITIES.map((v) => {
            const Icon = VIS_ICON[v];
            const active = form.visibility === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set("visibility", v)}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold transition",
                  active ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden /> {t(`visibility.${v}.label`)}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{t(`visibility.${form.visibility}.hint`)}</p>
      </div>

      {form.kind === "branch" ? (
        <Field label={t("form.parent")} hint={parents.length ? t("form.parentHint") : t("form.parentNone")}>
          <SelectInput value={form.parentId} onChange={(e) => set("parentId", e.target.value)} disabled={!parents.length}>
            <option value="">{t("form.parentEmpty")}</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {pointTitle(p)}
              </option>
            ))}
          </SelectInput>
        </Field>
      ) : null}

      <Field label={t("form.description")} hint={`${format.number(form.description.length)} / ${format.number(DESCRIPTION_MAX)}`}>
        <TextArea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={3}
          placeholder={t("form.descriptionPlaceholder")}
        />
      </Field>

      <Field label={t("form.website")}>
        <TextInput
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          inputMode="url"
          maxLength={255}
          placeholder="https://"
          autoComplete="url"
        />
      </Field>
    </>
  );
}
