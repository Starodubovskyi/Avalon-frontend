"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { AuthApi } from "@/lib/api/auth";
import { getAccessToken } from "@/lib/api/client";
import { DEMO_FLAG_KEY, isDemoToken } from "@/lib/demo/mode";
import type { AuthUser } from "@/lib/domain/map-point";

/** Another tab switched between a real and a demo session: this tab must not keep mixing them */
function crossesDemoBoundary(e: StorageEvent): boolean {
  if (e.key === null || e.key === DEMO_FLAG_KEY) return true;
  return e.key === "access_token" && isDemoToken(e.oldValue) !== isDemoToken(e.newValue);
}

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthed: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const genRef = useRef(0);

  const load = useCallback(async () => {
    const myGen = ++genRef.current;
    setLoading(true);
    try {
      if (!getAccessToken()) {
        if (myGen !== genRef.current) return;
        setUser(null);
        return;
      }
      const me = await AuthApi.me();
      if (myGen !== genRef.current) return;
      setUser(me);
    } catch (e) {
      if (myGen !== genRef.current) return;
      // A network blip or 5xx during a deploy must not sign the user out and unmount open forms;
      // only a rejected session (401, or tokens cleared by the refresh interceptor) does.
      const unauthorized = axios.isAxiosError(e) && e.response?.status === 401;
      if (unauthorized || !getAccessToken()) setUser(null);
    } finally {
      if (myGen === genRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onAuth = () => {
      void load();
    };
    window.addEventListener("authchange", onAuth);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    const onStorage = (e: StorageEvent) => {
      if (crossesDemoBoundary(e)) window.location.reload();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      genRef.current += 1;
      window.removeEventListener("authchange", onAuth);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
    };
  }, [load]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthed: !!user, refresh: load }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
