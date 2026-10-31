import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { PortGuideView } from "@/components/public/portGuide/PortGuideView";

export const metadata: Metadata = {
  title: "Port guide — Sulina channel & Danube ports · Avalon Shipping",
  description:
    "Indicative draught, pilotage, local time and cargoes for the Sulina channel, Izmail, Reni, Orlivka, Giurgiulești, Galați, Brăila and Tulcea.",
};

export default function PortGuidePage() {
  return (
    <PublicShell>
      <PortGuideView />
    </PublicShell>
  );
}
