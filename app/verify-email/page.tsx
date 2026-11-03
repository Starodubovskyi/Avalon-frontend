import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { VerifyEmailView } from "@/components/ops/verify/VerifyEmailView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("verifyEmail");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/** Public (no sign-in): the link from the point confirmation email lands here */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="brand-surface flex-1" />}>
      <VerifyEmailView />
    </Suspense>
  );
}
