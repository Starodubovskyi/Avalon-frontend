"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        if (v) router.push(`/support?q=${encodeURIComponent(v)}`);
      }}
      className="group w-full relative"
      aria-label="Search articles"
    >
      <div className="relative flex items-center w-full">
        <Search
          size={20}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for articles..."
          className="
            w-full h-14 pl-12 pr-6 rounded-full
            bg-white text-gray-900 placeholder:text-gray-400
            shadow-lg shadow-black/5
            focus:outline-none focus:ring-4 focus:ring-white/30
            transition-all text-base
            dark:bg-[#0d1117] dark:text-white dark:placeholder:text-gray-600
          "
        />
      </div>
    </form>
  );
}
