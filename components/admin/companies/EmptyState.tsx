"use client";

const card =
  "rounded-3xl border border-gray-200/70 bg-white/95 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur-sm " +
  "dark:bg-neutral-900/70 dark:border-white/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]";

export default function EmptyState({
  title = "Nothing here",
  subtitle = "Try changing filters",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={card + " p-10 text-center border-dashed"}>
      <div className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
        {title}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
    </div>
  );
}
