"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { AuthUser } from "@/lib/domain/map-point";
import { displayName } from "@/lib/auth/roles";
import { firstName, personName, type NameLabels } from "@/lib/network/format";
import { userName } from "@/lib/vessels/types";

/** Name helpers with their fallbacks ("Unknown", "User #12", "System") in the interface language */
export function useNames() {
  const t = useTranslations("common.names");
  return useMemo(() => {
    const labels: NameLabels = { unknown: t("unknown"), user: (id) => t("userId", { id: String(id) }) };
    return {
      person: (u: Parameters<typeof personName>[0]) => personName(u, labels),
      first: (u: Parameters<typeof firstName>[0]) => firstName(u, labels),
      user: (u: Parameters<typeof userName>[0]) => userName(u, { system: t("system"), user: labels.user }),
      display: (u: AuthUser | null | undefined) => displayName(u, t("user")),
    };
  }, [t]);
}
