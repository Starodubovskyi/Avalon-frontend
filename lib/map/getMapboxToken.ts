export function getMapboxToken(): string {
  const t = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
  if (!t) throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is missing");
  return t;
}
