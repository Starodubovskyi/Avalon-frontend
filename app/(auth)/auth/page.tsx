"use client";

import { Suspense } from "react";
import { LoginView } from "@/components/ops/auth/LoginView";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
