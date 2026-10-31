import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { HomeHero } from "@/components/public/home/HomeHero";
import { HomeProcess, HomeServices } from "@/components/public/home/HomeServices";
import { HomeCoverage, HomeCta, HomePortal } from "@/components/public/home/HomeCoverage";

export const metadata: Metadata = {
  title: "Avalon Shipping — Danube port agency",
  description:
    "Port agency from the Sulina roads to the berth: Izmail, Reni, Orlivka, Giurgiulești, Galați, Brăila and Tulcea. Request agency or estimate a PDA online.",
};

export default function HomePage() {
  return (
    <PublicShell>
      <HomeHero />
      <HomeServices />
      <HomeCoverage />
      <HomeProcess />
      <HomePortal />
      <HomeCta />
    </PublicShell>
  );
}
