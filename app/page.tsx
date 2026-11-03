import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicShell } from "@/components/public/PublicShell";
import { HomeHero } from "@/components/public/home/HomeHero";
import { HomeTrust } from "@/components/public/home/HomeTrust";
import { HomeProcess, HomeServices } from "@/components/public/home/HomeServices";
import { HomeBento } from "@/components/public/home/HomeBento";
import { HomeCoverage } from "@/components/public/home/HomeCoverage";
import { HomeCta } from "@/components/public/home/HomeCta";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: t("meta.title"), description: t("meta.description") };
}

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
