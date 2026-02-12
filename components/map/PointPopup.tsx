"use client";

import {
  IconX,
  IconPhone,
  IconMail,
  IconMapPin,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconUser,
  IconBriefcase,
} from "@tabler/icons-react";
import type { CustomPoint } from "../context/PointsContext";
import { useEffect, useRef } from "react";

interface PointPopupProps {
  point: CustomPoint;
  position: { x: number; y: number };
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PointPopup({
  point,
  position,
  onClose,
  onToggleFavorite,
  onDelete,
}: PointPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      // Анимация теперь slide-in слева, чтобы эффектно выезжало от точки
      className="absolute z-[50] w-[280px] animate-in fade-in slide-in-from-left-4 duration-200"
      style={{
        left: position.x,
        top: position.y,
        // Центрируем по вертикали относительно точки и сдвигаем вправо на 14px
        transform: "translateY(-50%)",
        marginLeft: "14px",
      }}
    >
      <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Хедер (фон) */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50/80 to-transparent dark:from-white/5 z-0" />

        <div className="relative z-10 flex justify-between items-start p-3">
          {/* Кнопка Избранное */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(point.id);
            }}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {point.isFavorite ? (
              <IconStarFilled size={18} className="text-yellow-400" />
            ) : (
              <IconStar size={18} className="text-gray-400" />
            )}
          </button>

          {/* Кнопка Закрыть */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Контент */}
        <div className="px-5 pb-5 pt-0 flex flex-col items-center text-center relative z-10 -mt-2">
          {/* Аватар */}
          <div className="w-16 h-16 rounded-full p-1 bg-white dark:bg-zinc-800 shadow-md mb-3">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              {point.photo ? (
                <img
                  src={point.photo}
                  alt={point.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IconUser size={28} className="text-gray-400" />
              )}
            </div>
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
            {point.firstName} {point.lastName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full">
            <IconBriefcase size={12} />
            {point.role || "No Role"}
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-white/5 my-4" />

          {/* Список контактов */}
          <div className="w-full space-y-2.5 text-left">
            {/* Адрес */}
            <div className="flex items-start gap-3 text-sm">
              <IconMapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 text-xs leading-snug line-clamp-2">
                {point.address || (
                  <span className="text-gray-400 italic">No address</span>
                )}
              </span>
            </div>

            {/* Телефон */}
            <div className="flex items-center gap-3 text-sm">
              <IconPhone size={16} className="text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                {point.phone || "—"}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-sm">
              <IconMail size={16} className="text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 font-medium text-xs truncate">
                {point.email || "—"}
              </span>
            </div>
          </div>

          <div className="mt-4 w-full text-[10px] text-gray-400 font-mono flex justify-center gap-2">
            <span>Lat: {point.lat.toFixed(4)}</span>
            <span>Lng: {point.lng.toFixed(4)}</span>
          </div>

          <button
            onClick={() => onDelete(point.id)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <IconTrash size={14} />
            Delete Point
          </button>
        </div>
      </div>

      <div
        className="absolute top-1/2 -translate-y-1/2 left-[-8px] w-0 h-0 
        border-t-[8px] border-t-transparent 
        border-b-[8px] border-b-transparent 
        border-r-[8px] border-r-white/95 dark:border-r-zinc-900/95 
        drop-shadow-sm"
      />
    </div>
  );
}
