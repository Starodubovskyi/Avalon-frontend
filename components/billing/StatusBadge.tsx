"use client";

export default function StatusBadge({ status }: { status: "paid" | "failed" }) {
  const isPaid = status === "paid";
  return (
    <span
      className={
        isPaid
          ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium dark:bg-emerald-500/10 dark:text-emerald-300"
          : "inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2.5 py-1 text-xs font-medium dark:bg-rose-500/10 dark:text-rose-300"
      }
    >
      <span className={`h-2 w-2 rounded-full ${isPaid ? "bg-emerald-500" : "bg-rose-500"}`} />
      {isPaid ? "Paid" : "Failed"}
    </span>
  );
}
