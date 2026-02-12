"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CustomPoint = {
  id: string;
  lat: number;
  lng: number;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  email: string;
  address?: string; // <-- НОВОЕ ПОЛЕ
  photo?: string | null; // <-- НОВОЕ ПОЛЕ (храним Base64 строку)
  isFavorite: boolean;
  dateAdded: string;
};

interface PointsContextType {
  points: CustomPoint[];
  addPoint: (
    point: Omit<CustomPoint, "id" | "dateAdded" | "isFavorite">,
  ) => void;
  toggleFavorite: (id: string) => void;
  deletePoint: (id: string) => void;
  updatePoint: (id: string, data: Partial<Omit<CustomPoint, "id">>) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState<CustomPoint[]>([]);

  // Загрузка из LocalStorage при старте
  useEffect(() => {
    const saved = localStorage.getItem("user_points");
    if (saved) {
      try {
        setPoints(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse points", e);
      }
    }
  }, []);

  // Сохранение при каждом изменении
  useEffect(() => {
    localStorage.setItem("user_points", JSON.stringify(points));
  }, [points]);

  const addPoint = (
    data: Omit<CustomPoint, "id" | "dateAdded" | "isFavorite">,
  ) => {
    const newPoint: CustomPoint = {
      ...data,
      id: crypto.randomUUID(),
      dateAdded: new Date().toLocaleDateString(),
      isFavorite: false,
    };
    setPoints((prev) => [...prev, newPoint]);
  };

  const toggleFavorite = (id: string) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)),
    );
  };

  const deletePoint = (id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePoint = (id: string, data: Partial<Omit<CustomPoint, "id">>) => {
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  return (
    <PointsContext.Provider
      value={{ points, addPoint, toggleFavorite, deletePoint, updatePoint }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context)
    throw new Error("usePoints must be used within a PointsProvider");
  return context;
};
