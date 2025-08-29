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
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-gray-200 dark:bg-white/10" />
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-6">
        <div className="text-gray-700 dark:text-gray-200">
          Vessel not found.
        </div>
        <button
          onClick={() => router.push("/vessels")}
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
