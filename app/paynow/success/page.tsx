import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading success...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
