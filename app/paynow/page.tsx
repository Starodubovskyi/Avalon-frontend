// app/paynow/page.tsx
import { Suspense } from "react";
import PayNowContent from "@/components/billing/PayNowContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <PayNowContent />
    </Suspense>
  );
}
