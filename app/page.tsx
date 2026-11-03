import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { HomeHero } from "@/components/public/home/HomeHero";
import { HomeTrust } from "@/components/public/home/HomeTrust";
import { HomeProcess, HomeServices } from "@/components/public/home/HomeServices";
import { HomeBento } from "@/components/public/home/HomeBento";
import { HomeCoverage } from "@/components/public/home/HomeCoverage";
import { HomeCta } from "@/components/public/home/HomeCta";

export const metadata: Metadata = {
  title: "Avalon Shipping — Danube port agency",
  description:
    "Port agency from the Sulina roads to the berth: Izmail, Reni, Orlivka, Giurgiulești, Galați, Brăila and Tulcea. Request agency or estimate a PDA online.",
};

export default function HomePage() {
  return (
    <PublicShell>
      <HomeHero />
      <HomeTrust />
      <HomeServices />
      <HomeBento />
      <HomeCoverage />
      <HomeProcess />
      <HomeCta />
    </PublicShell>
  );
}
