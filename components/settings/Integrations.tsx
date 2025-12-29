"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Loader2, X } from "lucide-react";

// --- ЛОГИКА ---
type ProviderKey = "google" | "github" | "facebook";
type Integration = {
  key: ProviderKey;
  name: string;
  connected: boolean;
  lastSynced?: string | null;
};
const LS_KEY = "avalon.integrations.v1";
const BRAND: Record<
  ProviderKey,
  {
    color: string;
    scopes: string[];
    Icon: (props: { className?: string }) => JSX.Element;
  }
> = {
  google: {
    color: "#4285F4",
    scopes: ["Profile", "Email"],
    Icon: ({ className }) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" />
        <path
          d="M12.4 12.7h4.9c-.1 1.4-.6 2.5-1.5 3.3-1 .9-2.3 1.4-3.9 1.4-1.7 0-3.1-.6-4.2-1.7A5.7 5.7 0 0 1 6 12a5.7 5.7 0 0 1 1.7-3.9 5.6 5.6 0 0 1 4.1-1.7c1.3 0 2.5.3 3.4 1 .9.7 1.5 1.6 1.7 2.6h-2.3c-.4-1-1.4-1.6-2.8-1.6-1 0-1.9.4-2.6 1.1-.7.8-1.1 1.8-1.1 3s.4 2.3 1.1 3c.7.8 1.6 1.2 2.7 1.2 1.7 0 2.9-.8 3.3-2.2h-3v-1.8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  github: {
    color: "#000000",
    scopes: ["Profile"],
    Icon: ({ className }) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="currentColor"
          d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.21c-3.2.7-3.87-1.4-3.87-1.4-.52-1.35-1.28-1.7-1.28-1.7-1.05-.73.07-.72.07-.72 1.16.09 1.78 1.22 1.78 1.22 1.03 1.8 2.71 1.28 3.37.98.1-.77.41-1.29.73-1.59-2.56-.3-5.25-1.3-5.25-5.75 0-1.27.45-2.3 1.2-3.1-.12-.31-.52-1.51.12-3.15 0 0 .98-.32 3.19 1.18.93-.26 1.92-.38 2.92-.38s1.99.12 2.92.38c2.21-1.5 3.19-1.18 3.19-1.18.64 1.64.24 2.84.12 3.15.75.8 1.2 1.83 1.2 3.1 0 4.47-2.71 5.45-5.3 5.75.42.36.79 1.07.79 2.17V22.35c0 .31.2.67.79.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
        />
      </svg>
    ),
  },
  facebook: {
    color: "#0866FF",
    scopes: ["Profile", "Email (optional)"],
    Icon: ({ className }) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="currentColor"
          d="M13.2 9.6V8.1c0-.7.2-1.2 1.2-1.2h1V4.9c-.5-.1-1.1-.2-1.7-.2-1.7 0-2.9 1.1-2.9 3v1.9H9v2.3h1.6V19h2.6v-6.1h1.9l.3-2.3h-2.2z"
        />
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
};
const DEFAULT_ITEMS: Integration[] = [
  { key: "google", name: "Google", connected: false, lastSynced: null },
  {
    key: "github",
    name: "GitHub",
    connected: true,
    lastSynced: "Today, 11:05",
  },
  { key: "facebook", name: "Facebook", connected: false, lastSynced: null },
];

export default function Integrations() {
  const [items, setItems] = useState<Integration[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState<Record<ProviderKey, boolean>>({
    google: false,
    github: false,
    facebook: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw) as Integration[]);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);
  const anyLoading = useMemo(
    () => Object.values(loading).some(Boolean),
    [loading]
  );
  function setLoadingFor(k: ProviderKey, v: boolean) {
    setLoading((p) => ({ ...p, [k]: v }));
  }
  function nowLabel() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `Today, ${hh}:${mm}`;
  }
  async function connect(key: ProviderKey) {
    setLoadingFor(key, true);
    await new Promise((r) => setTimeout(r, 700));
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, connected: true, lastSynced: nowLabel() } : i
      )
    );
    setLoadingFor(key, false);
    alert(`Access granted for ${key}.`);
  }
  async function disconnect(key: ProviderKey) {
    if (!confirm("Disconnect this integration? You can reconnect later."))
      return;
    setLoadingFor(key, true);
    await new Promise((r) => setTimeout(r, 400));
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, connected: false, lastSynced: null } : i
      )
    );
    setLoadingFor(key, false);
    alert("Integration disconnected.");
  }
  async function syncNow(key: ProviderKey) {
    setLoadingFor(key, true);
    await new Promise((r) => setTimeout(r, 600));
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, lastSynced: nowLabel() } : i))
    );
    setLoadingFor(key, false);
    alert("Synced.");
  }
  function testLogin(key: ProviderKey) {
    const it = items.find((x) => x.key === key);
    if (!it?.connected) return alert("Connect first.");
    alert(`Logged in via ${it.name} ✓`);
  }

  const CARD_CLASS =
    "rounded-[2rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm overflow-hidden";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Integrations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Connect external accounts to enable login and data sync.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((i) => {
          const b = BRAND[i.key];
          const isLoading = loading[i.key];

          return (
            <div
              key={i.key}
              className={clsx(
                CARD_CLASS,
                "flex flex-col sm:flex-row items-center p-6 gap-6 transition-all",
                isLoading && "opacity-80 scale-[0.99]"
              )}
            >
              {/* Icon & Info */}
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-gray-900 shadow-md ring-1 ring-gray-100 dark:bg-[#0d1117] dark:text-white dark:ring-white/10 shrink-0">
                  <b.Icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold">{i.name}</h3>
                    {i.connected ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide dark:bg-green-900/30 dark:text-green-300">
                        <Check size={10} strokeWidth={4} /> Connected
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide dark:bg-white/10">
                        Disconnected
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {i.lastSynced
                      ? `Synced: ${i.lastSynced}`
                      : `Scopes: ${b.scopes.join(", ")}`}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end ml-auto">
                {isLoading ? (
                  <Loader2 className="animate-spin text-gray-400" />
                ) : i.connected ? (
                  <>
                    <button
                      onClick={() => syncNow(i.key)}
                      className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 text-sm font-bold transition"
                    >
                      Sync
                    </button>
                    <button
                      onClick={() => testLogin(i.key)}
                      className="px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-sm font-bold transition"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => disconnect(i.key)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      title="Disconnect"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => connect(i.key)}
                    className="px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-transform"
                    style={{ background: b.color }}
                  >
                    Connect {i.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
