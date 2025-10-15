// /lib/auth/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { AuthApi } from "@/lib/api/auth";

export function useAuth<TUser = any>() {
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const me = await AuthApi.me<TUser>();
      setUser(me ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onAuth = () => load();
    window.addEventListener("authchange", onAuth);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("authchange", onAuth);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { user, loading, isAuthed: !!user, refresh: load };
}
