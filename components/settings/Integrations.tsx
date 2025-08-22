"use client";

import { useState } from "react";

type Integration = {
  key: "google" | "github" | "facebook";
  name: string;
  connected: boolean;
};

export default function Integrations() {
  const [items, setItems] = useState<Integration[]>([
    { key: "google", name: "Google", connected: false },
    { key: "github", name: "GitHub", connected: true },
    { key: "facebook", name: "Facebook", connected: false },
  ]);

  function toggle(key: Integration["key"]) {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, connected: !i.connected } : i)),
    );
    alert("Integration updated.");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Connect external accounts to enable login and data sync.
      </p>
      <div className="rounded-xl border border-gray-200 divide-y dark:divide-white/10 dark:border-white/10">
        {items.map((i) => (
          <div key={i.key} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {i.connected ? "Connected" : "Not connected"}
              </p>
            </div>
            <button
              onClick={() => toggle(i.key)}
              className={[
                "rounded-xl px-4 py-2 border border-gray-200 dark:border-white/10",
                i.connected
                  ? "hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-white/5",
              ].join(" ")}
            >
              {i.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
