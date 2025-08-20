"use client";

import { useRouter } from "next/navigation";

export default function AddCardTile({
  surfaceClass,
  fullHeight = false,
}: {
  surfaceClass: string;
  fullHeight?: boolean; 
}) {
  const router = useRouter();

  return (
    <div className={`${surfaceClass} bg-transparent p-0`}>
      <div
        className={`rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/15 grid place-content-center ${
          fullHeight ? "h-48 sm:h-56 md:h-64" : "h-48"
        }`}
      >
        <button
          className="inline-flex flex-col items-center gap-2 text-sm font-medium text-gray-700 hover:opacity-80 dark:text-gray-200"
          onClick={() => router.push("/paynow?flow=add-card")}
        >
          <span className="grid h-8 w-8 place-content-center rounded-full border border-gray-300 dark:border-white/15">+</span>
          Add New Card
        </button>
      </div>
    </div>
  );
}
