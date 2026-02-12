"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconPlus,
  IconSearch,
  IconMapPin,
  IconStar,
} from "@tabler/icons-react";
import clsx from "clsx";
import PointCard, { PointItem } from "./PointCard";
import { usePoints } from "../context/PointsContext"; // Убедитесь, что путь верный (или ../context/...)
import EditPointModal from "./EditPointModal";

export default function MyPointsView() {
  const router = useRouter();
  const { points, deletePoint, updatePoint } = usePoints(); // Получаем методы из контекста

  const [activeTab, setActiveTab] = useState<"custom" | "favorites">("custom");
  const [search, setSearch] = useState("");
  const [editingPointId, setEditingPointId] = useState<string | null>(null);

  // Преобразуем данные из контекста в формат для карточек
  const formattedPoints: PointItem[] = points.map((p) => ({
    id: p.id,
    type: "custom",
    title: `${p.firstName} ${p.lastName}`.trim() || "Unnamed Point",
    subtitle: p.role || `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`,
    dateAdded: p.dateAdded,
    notes: [p.email, p.phone].filter(Boolean).join(" • "),
    // @ts-ignore
    isFavorite: p.isFavorite,
  }));

  // Разделяем на списки
  const customList = formattedPoints;
  // @ts-ignore
  const favList = formattedPoints.filter((p) => p.isFavorite);

  // Выбираем текущий список
  const currentList = activeTab === "custom" ? customList : favList;

  // Фильтрация по поиску
  const filteredList = currentList.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase())),
  );

  // Находим объект точки для редактирования (из исходных данных контекста)
  const editingPointObj = points.find((p) => p.id === editingPointId) || null;

  return (
    <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            My Points
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your custom locations and favorite entities.
          </p>
        </div>

        <button
          onClick={() => router.push("/maps")}
          className="group flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
        >
          <IconPlus size={20} />
          <span>Add New Point</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center p-1 rounded-2xl bg-gray-100/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("custom")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === "custom"
                ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            <IconMapPin size={18} />
            My Markers
            <span className="ml-1 opacity-60 text-xs bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
              {customList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === "favorites"
                ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            <IconStar size={18} />
            Favorites
            <span className="ml-1 opacity-60 text-xs bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
              {favList.length}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <IconSearch size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search points..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-2xl border-none bg-white py-2.5 pl-10 pr-3 text-sm leading-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* Grid Content */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredList.map((item) => (
            <PointCard
              key={item.id}
              item={item}
              onDelete={(id) => deletePoint(id)}
              onEdit={(id) => setEditingPointId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 mb-4">
            <IconSearch
              size={32}
              className="text-gray-300 dark:text-gray-600"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No points found
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400 max-w-sm">
            We couldn't find any points matching your search. Try adjusting your
            filters or create a new point on the Map.
          </p>
          <button
            onClick={() => router.push("/maps")}
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Go to Map
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <EditPointModal
        open={!!editingPointId}
        point={editingPointObj}
        onClose={() => setEditingPointId(null)}
        onSave={(id, data) => {
          updatePoint(id, data);
          setEditingPointId(null);
        }}
      />
    </div>
  );
}
