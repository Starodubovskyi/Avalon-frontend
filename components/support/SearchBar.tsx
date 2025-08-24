"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";

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
      className="group w-full"
      aria-label="Search articles"
    >
      <div
        className="
          relative flex items-center gap-3 w-full
          rounded-xl px-4 py-3 ring-1 shadow-sm transition
          bg-sky-600/95 ring-white/20 text-white
          group-focus-within:bg-white group-focus-within:text-gray-900
          group-focus-within:ring-sky-300 group-focus-within:shadow-md
        "
      >
        <IconSearch
          size={20}
          className="
            flex-shrink-0 transition
            text-white/90
            group-focus-within:text-sky-600
          "
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for articles..."
          className="
            w-full bg-transparent outline-none text-[14px]
            placeholder:text-white/80 caret-white
            transition
            group-focus-within:placeholder:text-gray-400
            group-focus-within:text-gray-900
            group-focus-within:caret-sky-600
          "
        />
      </div>
    </form>
  );
}
