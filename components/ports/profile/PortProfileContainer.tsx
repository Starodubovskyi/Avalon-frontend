"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortProfileHeader from "./PortProfileHeader";
import PortProfileView from "./PortProfileView";
import { getPortById, type PublicPort } from "./publicPorts";

export default function PortProfileContainer() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const router = useRouter();
  const [p, setP] = useState<PublicPort | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (id) setP(getPortById(String(id)));
  }, [id]);

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-6 mt-6">
        <div className="h-8 w-64 rounded bg-gray-200 dark:bg-white/10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-2xl bg-gray-200 dark:bg-white/10" />
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mt-8 rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center bg-white dark:bg-white/5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Port not found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The port you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/ports")}
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white font-medium shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
        >
          Back to list
        </button>
      </div>
    );
  }

  const s = (v: unknown): string | undefined =>
    v === null || v === undefined ? undefined : String(v);

  return (
    <>
      <PortProfileHeader
        id={String(p.id)}
        port={String(p.port)}
        country={s(p.country)}
        flagEmoji={s((p as any).flagEmoji)}
        flagAlpha2={s((p as any).flagAlpha2)}
        unlocode={s(p.unlocode)}
      />
      <PortProfileView port={p} />
    </>
  );
}
