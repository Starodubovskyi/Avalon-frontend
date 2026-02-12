"use client";

import {
  IconMapPin,
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconMap2,
  IconShip,
  IconAnchor,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import Link from "next/link";

export type PointItem = {
  id: string;
  type: "custom" | "vessel" | "port";
  title: string;
  subtitle: string;
  dateAdded: string;
  notes?: string;
};

// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
interface PointCardProps {
  item: PointItem;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void; // <--- Добавили обязательный проп onEdit
}

export default function PointCard({ item, onDelete, onEdit }: PointCardProps) {
  const Icon =
    item.type === "vessel"
      ? IconShip
      : item.type === "port"
        ? IconAnchor
        : IconMapPin;

  const iconBg =
    item.type === "custom"
      ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
      : "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";

  return (
    <div className="group relative flex flex-col rounded-3xl border border-gray-200 bg-white/60 p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-300/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div
          className={clsx(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            iconBg,
          )}
        >
          <Icon size={24} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200">
              <IconDotsVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 rounded-xl bg-white/95 backdrop-blur-md dark:bg-black/90 border border-gray-100 dark:border-white/10"
          >
            {/* --- ВЫЗОВ onEdit ЗДЕСЬ --- */}
            <DropdownMenuItem
              onClick={() => onEdit(item.id)}
              className="cursor-pointer gap-2 rounded-lg focus:bg-gray-100 dark:focus:bg-white/10"
            >
              <IconEdit size={16} /> Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(item.id)}
              className="cursor-pointer gap-2 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-900/20"
            >
              <IconTrash size={16} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {item.title}
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {item.subtitle}
        </p>

        {item.notes && (
          <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-500 line-clamp-2">
            {item.notes}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/5">
        <span className="text-xs text-gray-400">Added {item.dateAdded}</span>

        <Link
          href={`/maps?focus=${item.id}`} // Обновили ссылку для перехода к точке
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <IconMap2 size={18} />
          View on Map
        </Link>
      </div>
    </div>
  );
}
