"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { AuthApi } from "@/lib/api/auth";

export default function AuthBadge() {
  const { user, loading, isAuthed } = useAuth();
  const router = useRouter();

  if (loading) return <span style={{ opacity: 0.7 }}>Loading…</span>;

  if (!isAuthed) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm">
          Login
        </Link>
        <Link href="/register" className="text-sm">
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/profile" className="text-sm">
        {user && ((user as any).firstName || (user as any).name || "Profile")}
      </Link>
      <button
        className="text-sm underline underline-offset-4"
        onClick={async () => {
          await AuthApi.logout();
          router.replace("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
