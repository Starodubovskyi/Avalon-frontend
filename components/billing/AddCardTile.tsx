"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function AddCardTile({
  surfaceClass,
  fullHeight = false,
}: {
  surfaceClass: string;
  fullHeight?: boolean;
}) {
  const router = useRouter();

  return (
    <div className={`${surfaceClass} bg-transparent p-0 h-full`}>
      <div
        className={`
          rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-white/10 
          bg-gray-50/50 dark:bg-white/5
          grid place-content-center transition-colors hover:bg-gray-100/80 dark:hover:bg-white/10
          ${fullHeight ? "h-48 sm:h-56 md:h-64" : "h-56"}
        `}
      >
        <button
          className="flex flex-col items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300 group"
          onClick={() => router.push("/paynow?flow=add-card")}
        >
          <div className="grid h-12 w-12 place-content-center rounded-full bg-white dark:bg-black shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6 text-blue-500" />
          </div>
          Add New Card
        </button>
      </div>
    </div>
  );
}
