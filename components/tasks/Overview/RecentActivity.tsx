"use client";
import { useProjectStore } from "../store/tasks";
function timeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hm = d.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (day.getTime() === today.getTime()) return `Today, ${hm}`;
  if (day.getTime() === yesterday.getTime()) return `Yesterday, ${hm}`;
  return (
    d.toLocaleString(undefined, { month: "short", day: "numeric" }) + `, ${hm}`
  );
}
export default function RecentActivity() {
  const list = useProjectStore((s) => s.activities);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 dark:bg-white/[0.04] dark:border-white/10">
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        Recent Activity
      </div>
      <div className="mt-3 space-y-2">
        {list.slice(0, 6).map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-white/[0.02] dark:border-white/10 dark:text-gray-200"
          >
            <span className="mt-0.5 text-green-600">●</span>
            <div className="flex-1">
              <div>{a.message}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {timeLabel(a.createdAt)}
              </div>
            </div>
          </div>
        ))}
        <button className="mt-1 text-left text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          View All
        </button>
      </div>
    </div>
  );
}
