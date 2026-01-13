"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VesselProfileHeader from "./VesselProfileHeader";
import VesselProfileView from "./VesselProfileView";
import {
  getVesselById,
  type PublicVessel,
} from "@/components/vessels/profile/publicVessels";

export default function VesselProfileContainer() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const router = useRouter();
  const [vessel, setVessel] = useState<PublicVessel | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (id) {
      const v = getVesselById(id);
      setVessel(v);
    }
  }, [id]);

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-gray-200 dark:bg-white/10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-gray-200 dark:bg-white/10" />
          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center bg-white dark:bg-white/5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Vessel not found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The vessel you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/vessels")}
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
      <VesselProfileHeader
        id={String(vessel.id)}
        name={String(vessel.name)}
        type={s(vessel.vesselType)}
        imo={s(vessel.imo)}
        flagEmoji={s((vessel as any).flagEmoji ?? vessel.flagEmoji)}
        flag={s((vessel as any).flag ?? vessel.country)}
        country={s((vessel as any).country)}
        flagAlpha2={s((vessel as any).flagAlpha2)}
      />
      <VesselProfileView vessel={vessel} />
    </>
  );
}
