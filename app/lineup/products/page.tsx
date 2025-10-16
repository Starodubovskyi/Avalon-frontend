import MainLayout from "@/components/layout/MainLayout";
import BgImage from "@/components/lineup/BgImage";
import ProductsHeader from "@/components/lineup/ProductsHeader";
import ProductsPills from "@/components/lineup/ProductsPills";
import ParallaxGlow from "@/components/lineup/ParallaxGlow";
import NoiseOverlay from "@/components/lineup/NoiseOverlay";
import GlassBreadcrumb from "@/components/lineup/GlassBreadcrumb";
import MiniStats from "@/components/lineup/MiniStats";
import FloatingCategoryIcons from "@/components/lineup/FloatingCategoryIcons";

export const metadata = { title: "Products — Avalol Ship" };

export default function ProductsPage() {
  return (
    <MainLayout>
      <main className="relative min-h-screen w-full overflow-hidden">
        <BgImage />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/60 to-black/80"
          aria-hidden
        />

        <header className="absolute left-6 top-6 md:left-10 md:top-10">
          <div className="flex flex-col gap-3">
            <GlassBreadcrumb />
            <ProductsHeader />
            <MiniStats />
          </div>
        </header>

        <section className="relative flex h-screen w-full flex-col items-center justify-center px-6">
          <FloatingCategoryIcons />
          <ProductsPills />
        </section>

        <ParallaxGlow />
        <NoiseOverlay />
      </main>
    </MainLayout>
  );
}
