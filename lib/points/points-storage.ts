import type { MapPoint } from "@/lib/domain/map-point";

export const LEGACY_KEY = "user_points";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scopedKey(userId: string | number): string {
  return `user_points:${userId}`;
}

function isDataUrl(value: string): boolean {
  return value.startsWith("data:");
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asUserId(
  value: unknown,
  fallback: string | number,
): string | number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) return value;
  return fallback;
}

function toIsoDate(value: unknown): string {
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

function nullableText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stripPhotoData(point: MapPoint): MapPoint {
  const photoId =
    point.photoId && !isDataUrl(point.photoId) ? point.photoId : null;
  return { ...point, photoId };
}

function parsePoint(raw: unknown, userId: string | number): MapPoint | null {
  if (!isRecord(raw)) return null;

  const lat = asNumber(raw.lat);
  const lng = asNumber(raw.lng);
  if (lat === undefined || lng === undefined) return null;

  const id = asString(raw.id) || crypto.randomUUID();
  const firstName = asString(raw.firstName) ?? "";
  const lastName = asString(raw.lastName) ?? "";
  const activity = asString(raw.activity) ?? asString(raw.role) ?? "";
  const createdAt = toIsoDate(raw.createdAt ?? raw.dateAdded);
  const updatedAt = toIsoDate(raw.updatedAt ?? raw.createdAt ?? raw.dateAdded);

  let photoId: string | null = nullableText(raw.photoId);
  if (photoId && isDataUrl(photoId)) photoId = null;

  const photo = asString(raw.photo);
  if (photo && isDataUrl(photo)) {
    photoId = null;
  } else if (!photoId && photo && !isDataUrl(photo)) {
    photoId = photo;
  }

  return stripPhotoData({
    id,
    userId: asUserId(raw.userId, userId),
    lat,
    lng,
    firstName,
    lastName,
    activity,
    phone: nullableText(raw.phone),
    email: nullableText(raw.email),
    address: nullableText(raw.address),
    photoId,
    isFavorite: asBoolean(raw.isFavorite) ?? false,
    createdAt,
    updatedAt,
  });
}

export function loadPoints(userId: string | number): MapPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scopedKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => parsePoint(item, userId))
      .filter((point): point is MapPoint => point !== null)
      .map(stripPhotoData);
  } catch {
    return [];
  }
}

export function savePoints(userId: string | number, points: MapPoint[]): boolean {
  if (typeof window === "undefined") return false;
  const cleaned = points.map(stripPhotoData);
  try {
    localStorage.setItem(scopedKey(userId), JSON.stringify(cleaned));
    return true;
  } catch (error) {
    const quotaExceeded =
      (error instanceof DOMException &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
          error.code === 22)) ||
      (error instanceof Error && error.name === "QuotaExceededError");
    if (quotaExceeded) {
      console.error("QuotaExceeded while saving points", error);
    } else {
      console.error("Failed to save points", error);
    }
    return false;
  }
}

export function migrateLegacyIfNeeded(userId: string | number): void {
  if (typeof window === "undefined") return;
  const existing = loadPoints(userId);
  if (existing.length > 0) return;

  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) return;

  try {
    const parsed: unknown = JSON.parse(legacyRaw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }

    const migrated = parsed
      .map((item) => {
        const point = parsePoint(item, userId);
        if (!point) return null;
        return stripPhotoData({
          ...point,
          userId,
          createdAt: toIsoDate(
            isRecord(item) ? (item.createdAt ?? item.dateAdded) : undefined,
          ),
          updatedAt: toIsoDate(
            isRecord(item) ? (item.updatedAt ?? item.createdAt ?? item.dateAdded) : undefined,
          ),
          activity:
            point.activity ||
            (isRecord(item) && typeof item.role === "string" ? item.role : ""),
          photoId:
            point.photoId && !isDataUrl(point.photoId) ? point.photoId : null,
        });
      })
      .filter((point): point is MapPoint => point !== null);

    savePoints(userId, migrated);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    localStorage.removeItem(LEGACY_KEY);
  }
}
