"use client";

import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";

export default function GlassBreadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 backdrop-blur-xl shadow-2xl"
    >
      <LayoutGrid className="h-4 w-4 opacity-90" />
      <Link
        href="/lineup"
        role="button"
        className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[13px] text-white/90 transition hover:bg-white/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
        aria-label="Go to Line Up"
      >
        Line Up
      </Link>
      <ChevronRight className="h-4 w-4 opacity-70" />
      <span className="text-white">Products</span>
    </nav>
  );
}
