import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ports");
  return { title: t("metaTitle") };
}

/** Pass-through: the page renders its own AppShell, so no second shell here */
export default function PortsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
