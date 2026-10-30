"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, isAdmin } from "@/lib/auth/roles";
import { OpsSidebar } from "./OpsSidebar";
import { Topbar } from "./Topbar";
import { LoadingBlock } from "../ui/primitives";

type Access = "any" | "staff" | "admin";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  /** full-bleed content (map) without page padding/scroll */
  fill?: boolean;
  access?: Access;
}

export function AppShell({ children, title, fill = false, access = "any" }: AppShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }

  const allowed =
    access === "any" || (access === "staff" && canEdit(user)) || (access === "admin" && isAdmin(user));

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <OpsSidebar className="hidden lg:flex" />

      <div
        className={cn(
          "fixed inset-0 z-50 transition-[visibility] lg:hidden",
          menuOpen ? "visible" : "invisible delay-200",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn("absolute inset-0 bg-black/50 transition-opacity", menuOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex transition-transform duration-200",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <OpsSidebar onNavigate={() => setMenuOpen(false)} />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="m-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenu={() => setMenuOpen(true)} />
        <main className={cn("min-h-0 flex-1", fill ? "relative flex flex-col overflow-hidden" : "overflow-y-auto")}>
          {!allowed ? (
            <div className="mx-auto max-w-lg p-10 text-center">
              <p className="text-lg font-semibold">No access</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This section is available to Avalon staff only. Ask an administrator to change your role.
              </p>
            </div>
          ) : fill ? (
            children
          ) : (
            <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-6">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}
