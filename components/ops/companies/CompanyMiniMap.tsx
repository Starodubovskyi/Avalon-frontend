"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Map as MapIcon, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getMapboxToken } from "@/lib/map/getMapboxToken";
import { POINT_KIND_COLORS, type TeamPoint } from "@/lib/points/team-points";
import { POINT_KIND_CLASS, POINT_KIND_ICON } from "../map/PointKindIcon";

function staticMapUrl(point: TeamPoint, dark: boolean): string | null {
  let token: string;
  try {
    token = getMapboxToken();
  } catch {
    return null;
  }
  const style = dark ? "dark-v11" : "light-v11";
  const color = POINT_KIND_COLORS[point.kind].base.slice(1);
  const at = `${point.lng.toFixed(5)},${point.lat.toFixed(5)}`;
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/pin-l+${color}(${at})/${at},12.5,0/640x360@2x?access_token=${encodeURIComponent(token)}&logo=false&attribution=false`;
}

/** Static Mapbox snapshot around the point; opens the fleet map focused on it */
export function CompanyMiniMap({ point }: { point: TeamPoint }) {
  const t = useTranslations("companies");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => setMounted(true), []);
  const url = mounted ? staticMapUrl(point, resolvedTheme === "dark") : null;
  const Icon = POINT_KIND_ICON[point.kind];

  return (
    <Link
      href={`/maps?point=${point.id}`}
      className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border bg-muted shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      aria-label={t("map.open")}
    >
      {url && !failed ? (
        <Image src={url} alt="" fill unoptimized priority sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" onError={() => setFailed(true)} />
      ) : (
        <div className="map-grid absolute inset-0 flex items-center justify-center">
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white", POINT_KIND_CLASS[point.kind].gradient, POINT_KIND_CLASS[point.kind].glow)}>
            <Icon className="h-6 w-6" aria-hidden />
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-white">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium tabular-nums">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {point.lat.toFixed(4)}°, {point.lng.toFixed(4)}°
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur transition group-hover:bg-white/30">
          <MapIcon className="h-3.5 w-3.5" aria-hidden /> {t("map.open")}
        </span>
      </div>
    </Link>
  );
}
