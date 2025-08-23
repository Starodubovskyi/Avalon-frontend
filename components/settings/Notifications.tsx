"use client";

import { useState } from "react";

export default function Notifications() {
  const [channels, setChannels] = useState({
    push: true,
    email: false,
    inApp: true,
  });

  const [types, setTypes] = useState({
    messages: true,
    followers: true,
    system: true,
    marketing: false,
  });

  function toggleChannel(key: keyof typeof channels) {
    setChannels((p) => ({ ...p, [key]: !p[key] }));
  }
  function toggleType(key: keyof typeof types) {
    setTypes((p) => ({ ...p, [key]: !p[key] }));
  }

  function save() {
    alert("Notification preferences saved.");
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Channels</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["push", "email", "inApp"] as const).map((c) => (
            <label key={c} className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-white/10 cursor-pointer">
              <div>
                <p className="font-medium capitalize">{c === "inApp" ? "In-app" : c}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive via {c === "inApp" ? "app" : c}.</p>
              </div>
              <input
                type="checkbox"
                checked={channels[c]}
                onChange={() => toggleChannel(c)}
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">What to notify about</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {(["messages", "followers", "system", "marketing"] as const).map((t) => (
            <label key={t} className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-white/10 cursor-pointer">
              <span className="capitalize">{t}</span>
              <input
                type="checkbox"
                checked={types[t]}
                onChange={() => toggleType(t)}
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>
      </section>

      <div>
        <button onClick={save} className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
          Save changes
        </button>
      </div>
    </div>
  );
}
