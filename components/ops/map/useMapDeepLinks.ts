"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { POINT_KINDS, type PointKind, type TeamPoint } from "@/lib/points/team-points";

/**
 * Deep links into the fleet map: ?point=<id> focuses a pin (shared links, "On map" in Companies),
 * ?add=<kind> starts placing a new one. Each link is applied once, after the points have loaded;
 * a link that can't be applied (unknown or hidden point, no points left to add) says so in a toast.
 */
export function useMapDeepLinks({
  points,
  canAdd,
  onFocus,
  onAdd,
}: {
  points: TeamPoint[] | undefined;
  canAdd: boolean;
  onFocus: (point: TeamPoint) => void;
  onAdd: (kind: PointKind) => void;
}) {
  const t = useTranslations("map");
  const params = useSearchParams();
  const linkedPoint = params?.get("point") ?? null;
  const linkedAdd = params?.get("add") ?? null;
  const applied = useRef<string | null>(null);
  const handlers = useRef({ onFocus, onAdd });
  handlers.current = { onFocus, onAdd };

  useEffect(() => {
    // the quota and the point lookup both need the list
    if (!points) return;
    const key = `${linkedPoint ?? ""}|${linkedAdd ?? ""}`;
    if (applied.current === key || (!linkedPoint && !linkedAdd)) return;
    applied.current = key;
    if (linkedAdd && (POINT_KINDS as readonly string[]).includes(linkedAdd)) {
      if (canAdd) handlers.current.onAdd(linkedAdd as PointKind);
      else toast.error(t("deepLink.limit"));
      return;
    }
    if (linkedPoint) {
      const linked = points.find((p) => p.id === linkedPoint);
      if (linked) handlers.current.onFocus(linked);
      else toast.error(t("deepLink.notFound"));
    }
  }, [linkedPoint, linkedAdd, points, canAdd, t]);
}
