"use client";

export default function KpiCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: string | number;
  delta?: number;
}) {
  const deltaSign = typeof delta === "number" ? (delta > 0 ? "+" : "") : "";
  const deltaColor =
    typeof delta !== "number"
      ? "text-gray-500"
      : delta > 0
      ? "text-emerald-600"
      : delta < 0
      ? "text-rose-600"
      : "text-gray-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white/70 dark:bg-white/5">
      <div className="text-sm opacity-60">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {typeof delta === "number" && (
        <div className={`text-xs mt-1 ${deltaColor}`}>
          {deltaSign}
          {delta}
          %
        </div>
      )}
    </div>
  );
}
