"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  CreateMapPointDto,
  MapPoint,
} from "@/lib/domain/map-point";
import { useAuth } from "@/lib/auth/useAuth";
import {
  createMapPoint,
  deleteMapPoint,
  isAbortError,
  listMapPoints,
  updateMapPoint,
} from "@/lib/api/map-points";
import {
  loadPoints,
  migrateLegacyIfNeeded,
  savePoints,
} from "@/lib/points/points-storage";

export type { MapPoint };

interface PointsContextType {
  points: MapPoint[];
  addPoint: (point: CreateMapPointDto) => void;
  toggleFavorite: (id: string) => void;
  deletePoint: (id: string) => void;
  updatePoint: (
    id: string,
    data: Partial<Omit<MapPoint, "id" | "userId">>,
  ) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

function toCreatePayload(point: MapPoint): CreateMapPointDto {
  return {
    lat: point.lat,
    lng: point.lng,
    firstName: point.firstName || "Contact",
    lastName: point.lastName,
    activity: point.activity,
    phone: point.phone ?? undefined,
    email: point.email ?? undefined,
    address: point.address ?? undefined,
    photoId: point.photoId ?? undefined,
  };
}

async function uploadMissingLocalPoints(
  local: MapPoint[],
  remote: MapPoint[],
  signal: AbortSignal,
): Promise<MapPoint[]> {
  const remoteIds = new Set(remote.map((point) => point.id));
  const uploaded: MapPoint[] = [];
  for (const point of local) {
    if (signal.aborted) return uploaded;
    if (remoteIds.has(point.id)) continue;
    try {
      const created = await createMapPoint(toCreatePayload(point), signal);
      if (point.isFavorite && !created.isFavorite) {
        uploaded.push(await updateMapPoint(created.id, { isFavorite: true }));
      } else {
        uploaded.push(created);
      }
    } catch (error) {
      if (isAbortError(error)) throw error;
      uploaded.push(point);
    }
  }
  return uploaded;
}

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const hydratedForUserRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!userId) {
      setPoints([]);
      setHydrated(false);
      hydratedForUserRef.current = null;
      return;
    }

    const ac = new AbortController();
    let cancelled = false;

    const hydrate = async () => {
      migrateLegacyIfNeeded(userId);
      const local = loadPoints(userId);
      setHydrated(false);
      try {
        const remote = await listMapPoints(ac.signal);
        if (cancelled) return;
        const extra = await uploadMissingLocalPoints(local, remote, ac.signal);
        if (cancelled) return;
        const next = [...remote, ...extra];
        if (cancelled) return;
        setPoints(next);
        savePoints(userId, next);
        hydratedForUserRef.current = userId;
        setHydrated(true);
      } catch (error) {
        if (cancelled || isAbortError(error)) return;
        setPoints(local);
        hydratedForUserRef.current = userId;
        setHydrated(true);
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [userId, loading]);

  useEffect(() => {
    if (!hydrated || !userId) return;
    if (hydratedForUserRef.current !== userId) return;
    savePoints(userId, points);
  }, [points, hydrated, userId]);

  const addPoint = (data: CreateMapPointDto) => {
    if (!userId || !hydrated) return;
    const now = new Date().toISOString();
    const tempId = crypto.randomUUID();
    const optimistic: MapPoint = {
      id: tempId,
      userId,
      lat: data.lat,
      lng: data.lng,
      firstName: data.firstName,
      lastName: data.lastName ?? "",
      activity: data.activity ?? "",
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      photoId: data.photoId ?? null,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    setPoints((prev) => [...prev, optimistic]);
    void createMapPoint(data)
      .then((created) => {
        setPoints((prev) =>
          prev.map((point) => (point.id === tempId ? created : point)),
        );
      })
      .catch(() => {
        /* keep optimistic local copy so the pin is not lost */
      });
  };

  const toggleFavorite = (id: string) => {
    const current = points.find((p) => p.id === id);
    if (!current) return;
    const nextFavorite = !current.isFavorite;
    const now = new Date().toISOString();
    setPoints((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isFavorite: nextFavorite, updatedAt: now } : p,
      ),
    );
    void updateMapPoint(id, { isFavorite: nextFavorite }).catch(() => {
      setPoints((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isFavorite: !nextFavorite } : p,
        ),
      );
    });
  };

  const deletePoint = (id: string) => {
    let removed: MapPoint | undefined;
    setPoints((prev) => {
      removed = prev.find((p) => p.id === id);
      return prev.filter((p) => p.id !== id);
    });
    void deleteMapPoint(id).catch(() => {
      if (!removed) return;
      const restored = removed;
      setPoints((prev) =>
        prev.some((p) => p.id === restored.id) ? prev : [...prev, restored],
      );
    });
  };

  const updatePoint = (
    id: string,
    data: Partial<Omit<MapPoint, "id" | "userId">>,
  ) => {
    const now = new Date().toISOString();
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now } : p)),
    );
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = data;
    void updateMapPoint(id, rest).catch(() => {
      /* keep optimistic edit; hydrate uploads ids still missing on server */
    });
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
