import MainLayout from "@/components/layout/MainLayout";
import Brand from "@/components/lineup/Brand";
import HeroTitle from "@/components/lineup/HeroTitle";
import NavButtons from "@/components/lineup/NavButtons";
import BgImage from "@/components/lineup/BgImage";
import GlassBreadcrumbRoot from "@/components/lineup/GlassBreadcrumbRoot";

export const metadata = { title: "Line Up — Avalol Ship" };

export default function LineUpPage() {
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
            <GlassBreadcrumbRoot />
            <Brand />
          </div>
        </header>

        <section className="flex h-screen w-full flex-col items-center justify-center px-6">
          <HeroTitle />
          <NavButtons />
        </section>
      </main>
    </MainLayout>
  );
}
