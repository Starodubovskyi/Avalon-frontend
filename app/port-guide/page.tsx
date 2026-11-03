import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicShell } from "@/components/public/PublicShell";
import { PortGuideView } from "@/components/public/portGuide/PortGuideView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("publicPages");
  return { title: t("guide.metaTitle"), description: t("guide.metaDescription") };
}

export default function PortGuidePage() {
  return (
    <PublicShell>
      <PortGuideView />
    </PublicShell>
  );
}
