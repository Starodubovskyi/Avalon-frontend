"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { POINT_KIND_LABEL, pointTitle, type TeamPoint } from "@/lib/points/team-points";
import { TextInput } from "../ui/primitives";
import { PointKindIcon } from "./PointKindIcon";

export function MapPointList({
  points,
  selectedId,
  onSelect,
  query,
  onQuery,
}: {
  points: TeamPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Find company or person" className="h-9 pl-9" aria-label="Find point" />
        </div>
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {points.length === 0 ? (
          <li className="px-3 py-10 text-center text-sm text-muted-foreground">
            No points yet. Use <span className="font-semibold text-foreground">Add point</span> and click on the map.
          </li>
        ) : null}
        {points.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition",
                selectedId === p.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent",
              )}
            >
              <PointKindIcon kind={p.kind} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{pointTitle(p)}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {POINT_KIND_LABEL[p.kind]}
                  {p.activity ? ` · ${p.activity}` : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
