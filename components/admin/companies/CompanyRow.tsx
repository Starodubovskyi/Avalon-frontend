"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Pencil, Clock, MoreHorizontal } from "lucide-react";
import type { AdminCompany, CompanyStatus } from "./types";
import { useAdminCompaniesStore } from "./store/adminCompaniesStore";
import clsx from "clsx";

const statusColor: Record<CompanyStatus, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  published:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  archived: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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
    <tr
      className={clsx(
        "group transition-colors",
        selected
          ? "bg-blue-50/60 dark:bg-blue-900/10"
          : "hover:bg-gray-50/80 dark:hover:bg-white/5"
      )}
    >
      <td className="px-6 py-4">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          className="rounded-md border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
            <AvatarImage
              src={it.logoUrl}
              alt={it.name}
              className="object-cover"
            />
            <AvatarFallback
              className={`rounded-2xl text-white font-bold text-xs ${GRADIENT_BG}`}
            >
              {it.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 dark:text-white truncate">
              {it.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {it.owner}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
        {it.category}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
        {it.country}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {it.city}
      </td>
      <td className="px-6 py-4">
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
            statusColor[it.status]
          )}
        >
          {it.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full",
                it.completeness === 100 ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${it.completeness}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-500">
            {it.completeness}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {new Date(it.updatedAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              quickUpdateStatus(
                it.id,
                it.status === "published" ? "suspended" : "published"
              )
            }
            className={clsx(
              "h-8 rounded-lg px-3 text-xs font-bold",
              it.status === "published"
                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                : "text-green-600 hover:text-green-700 hover:bg-green-50"
            )}
          >
            {it.status === "published" ? "Suspend" : "Publish"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onQuickEdit}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Pencil className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onHistory}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Clock className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            asChild
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <a href="/companies" target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
            </a>
          </Button>
        </div>
      </td>
    </tr>
  );
}
