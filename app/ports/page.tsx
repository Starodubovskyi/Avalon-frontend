"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PortsApi } from "@/lib/api/ports";
import { ensureAccessToken } from "@/lib/api/client";

const PortsPage = dynamic(() => import("@/components/ports/PortsPage"), {
  ssr: false,
});

function normalizeList<T = any>(resp: any): T[] {
  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray(resp.items)) return resp.items;
  if (resp && Array.isArray(resp.data)) return resp.data;
  return [];
}

export default function PortsRoutePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await ensureAccessToken();
        const resp = await PortsApi.list({ limit: 50 });
        if (!alive) return;
        setRows(normalizeList(resp));
      } catch (e) {
        console.error(e);
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
      <PortsPage initialRows={rows} />
    </div>
  );
}
