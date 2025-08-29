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
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-gray-200 dark:bg-white/10" />
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-6">
        <div className="text-gray-700 dark:text-gray-200">Port not found.</div>
        <button
          onClick={() => router.push("/ports")}
          className="mt-3 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
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
