"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Pencil, Clock } from "lucide-react";
import type { AdminCompany, CompanyStatus } from "./types";
import { useAdminCompaniesStore } from "./store/adminCompaniesStore";

const statusColor: Record<CompanyStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  published:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  archived:
    "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
};

interface Props {
  company: AdminCompany;
  selected: boolean;
  onToggleSelect: () => void;
  onQuickEdit: () => void;
  onHistory: () => void;
}

export default function CompanyRow({
  company: it,
  selected,
  onToggleSelect,
  onQuickEdit,
  onHistory,
}: Props) {
  const { quickUpdateStatus } = useAdminCompaniesStore();
  return (
    <tr className="hover:bg-gray-50/70 dark:hover:bg-white/5">
      <td className="px-3 py-3">
        <Checkbox checked={selected} onCheckedChange={onToggleSelect} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-xl border border-gray-200 dark:border-white/10">
            <AvatarImage src={it.logoUrl} alt={it.name} />
            <AvatarFallback className="rounded-xl">
              {it.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{it.name}</div>
            <div className="text-xs text-gray-500">{it.owner}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">{it.category}</td>
      <td className="px-3 py-3 text-sm">{it.country}</td>
      <td className="px-3 py-3 text-sm">{it.city}</td>
      <td className="px-3 py-3">
        <span
          className={
            "px-2 py-1 rounded-full text-xs font-medium " +
            statusColor[it.status]
          }
        >
          {it.status}
        </span>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-2 bg-green-500 dark:bg-green-400"
              style={{ width: `${it.completeness}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            {it.completeness}%
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap">
        <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4" />
          {new Date(it.updatedAt).toLocaleString()}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              quickUpdateStatus(
                it.id,
                it.status === "published" ? "suspended" : "published"
              )
            }
          >
            {it.status === "published" ? "Suspend" : "Publish"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onQuickEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onHistory} title="History">
            <Clock className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <a href="/companies" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </td>
    </tr>
  );
}
