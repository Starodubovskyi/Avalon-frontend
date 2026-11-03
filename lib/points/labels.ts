"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ActivityCode } from "./activities";
import type { PointKind, PointVisibility } from "./team-points";

/** Translated names of point kinds, Business Activities and visibility ("points" dictionary) */
export function usePointLabels() {
  const t = useTranslations("points");
  return useMemo(
    () => ({
      kind: (k: PointKind) => t(`kinds.${k}.label`),
      kindShort: (k: PointKind) => t(`kinds.${k}.short`),
      kindPlural: (k: PointKind) => t(`kinds.${k}.plural`),
      kindHint: (k: PointKind) => t(`kinds.${k}.hint`),
      activity: (code: ActivityCode) => t(`activities.${code}`),
      visibility: (v: PointVisibility) => t(`visibility.${v}.label`),
      /** Card line: the first activity, else the legacy free text */
      activityLine: (p: { activities: readonly ActivityCode[]; activity?: string | null }) => {
        const code = p.activities[0];
        return code ? t(`activities.${code}`) : (p.activity ?? "").trim();
      },
      /** Every activity of the point, comma separated */
      activityList: (p: { activities: readonly ActivityCode[]; activity?: string | null }) =>
        p.activities.length ? p.activities.map((c) => t(`activities.${c}`)).join(", ") : (p.activity ?? "").trim(),
    }),
    [t],
  );
}

export type PointLabels = ReturnType<typeof usePointLabels>;
