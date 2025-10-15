import Link from "next/link";
import type { Metadata } from "next";
import { mockVesselsData } from "@/components/lineup/ports/detail/externalVesselsMock";
import LiquidPageClient from "../liquid/LiquidPageClient";
import {
  CHIP_PRESETS,
  isCrude,
} from "@/components/lineup/product/liquid/utils";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = { title: "Crude — Avalol Ship" };

export default function Page({
  searchParams,
}: {
  searchParams?: { q?: string; sub?: string };
}) {
  const query = searchParams?.q ?? "";
  const subFromUrl = (searchParams?.sub ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const vessels = (mockVesselsData ?? []).filter(isCrude);

  const total = vessels.length;
  const inPort = vessels.filter(
    (v: any) => (v.zone || "").toLowerCase() === "port"
  ).length;
  const anch = vessels.filter(
    (v: any) => (v.zone || "").toLowerCase() === "anchorage"
  ).length;
  const transit = total - inPort - anch;

  return (
    <MainLayout>
      <main className="min-h-screen w-full bg-white dark:bg-neutral-950">
        <div className="w-full px-4 pt-6 md:px-6 md:pt-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <Link
              href="/lineup"
              className="rounded-full px-2 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Line Up
            </Link>
            <span className="opacity-50">/</span>
            <Link
              href="/lineup/products"
              className="rounded-full px-2 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Products
            </Link>
            <span className="opacity-50">/</span>
            <span className="font-medium">Crude</span>
          </nav>
        </div>

        <div className="w-full px-4 pb-10 md:px-6">
          <LiquidPageClient
            initialVessels={vessels}
            initialQuery={query}
            initialSubTypes={subFromUrl}
            metrics={{ total, inPort, anch, transit }}
            title="Crude"
            subtitle="Crude oil flows: Arab, Bonny, Urals, Brent grades."
            // chips={CHIP_PRESETS.crude}
          />
        </div>
      </main>
    </MainLayout>
  );
}
