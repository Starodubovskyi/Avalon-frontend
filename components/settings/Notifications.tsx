"use client";

import { useEffect, useState } from "react";

type Digest = "instant" | "daily";

type Prefs = {
  channels: { push: boolean; email: boolean; inApp: boolean };
  types: {
    messages: boolean;
    followers: boolean;
    system: boolean;
    marketing: boolean;
  };
  digest: Digest;
  emailTime: string;
  quiet: { enabled: boolean; start: string; end: string };
};

const LS_KEY = "avalon.notifications.simple";

const DEFAULTS: Prefs = {
  channels: { push: true, email: false, inApp: true },
  types: { messages: true, followers: true, system: true, marketing: false },
  digest: "instant",
  emailTime: "09:00",
  quiet: { enabled: false, start: "22:00", end: "08:00" },
};

function cls(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cls(
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        checked ? "bg-blue-600" : "bg-gray-300 dark:bg-white/10",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <span
        className={cls(
          "inline-block h-5 w-5 transform rounded-full bg-white transition",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function Notifications() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Prefs;
        setPrefs({ ...DEFAULTS, ...parsed });
      } catch {
        setPrefs(DEFAULTS);
      }
    }
  }, []);

  function set<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setPrefs((p) => ({ ...p, [k]: v }));
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
    alert("Saved.");
  }

  function reset() {
    if (!confirm("Reset to defaults?")) return;
    setPrefs(DEFAULTS);
    localStorage.setItem(LS_KEY, JSON.stringify(DEFAULTS));
  }

  async function testNotification() {
    setPreview(true);
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted" && prefs.channels.push) {
      new Notification("Avalon", { body: "Test notification" });
    } else if (Notification.permission !== "denied" && prefs.channels.push) {
      const perm = await Notification.requestPermission();
      if (perm === "granted")
        new Notification("Avalon", { body: "Test notification" });
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Notifications
      </h1>

      {/* Channels */}
      <section className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Channels</h2>
          <button
            onClick={testNotification}
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Send test
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["push", "email", "inApp"] as const).map((c) => (
            <div
              key={c}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-white/10"
            >
              <div>
                <p className="font-medium capitalize">
                  {c === "inApp" ? "In-app" : c}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {c === "inApp" ? "Show inside the app" : `Send via ${c}`}
                </p>
              </div>
              <Switch
                checked={prefs.channels[c]}
                onChange={(v) => set("channels", { ...prefs.channels, [c]: v })}
              />
            </div>
          ))}
        </div>
        {preview && prefs.channels.inApp && (
          <div className="mt-3 rounded-xl border border-emerald-300/60 bg-emerald-50 p-3 text-sm dark:border-emerald-900/30 dark:bg-emerald-900/10">
            <div className="flex items-start gap-2">
              <span className="text-lg">🔔</span>
              <div>
                <div className="font-medium">In-app notification</div>
                <div className="text-gray-600 dark:text-gray-300">
                  This is a test.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Types */}
      <section className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
        <h2 className="mb-3 text-lg font-medium">Notify about</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {(["messages", "followers", "system", "marketing"] as const).map(
            (t) => (
              <label
                key={t}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-white/10 cursor-pointer"
              >
                <span className="capitalize">{t}</span>
                <Switch
                  checked={prefs.types[t]}
                  onChange={(v) => set("types", { ...prefs.types, [t]: v })}
                />
              </label>
            )
          )}
        </div>
      </section>

      {/* Simple options */}
      <section className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
        <h2 className="mb-3 text-lg font-medium">Options</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Digest */}
          <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
            <div className="text-sm mb-2">E-mail digest</div>
            <div className="flex gap-2">
              {(["instant", "daily"] as Digest[]).map((d) => (
                <button
                  key={d}
                  onClick={() => set("digest", d)}
                  className={cls(
                    "rounded-xl px-3 py-2 text-sm border",
                    prefs.digest === d
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-300"
                      : "border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                  )}
                >
                  {d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Daily at
              </label>
              <input
                type="time"
                value={prefs.emailTime}
                onChange={(e) => set("emailTime", e.target.value)}
                disabled={prefs.digest !== "daily"}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm disabled:opacity-60 dark:border-white/10"
              />
            </div>
          </div>

          {/* Quiet hours */}
          <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10 sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm">Quiet hours</div>
              <Switch
                checked={prefs.quiet.enabled}
                onChange={(v) => set("quiet", { ...prefs.quiet, enabled: v })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Start
                </label>
                <input
                  type="time"
                  value={prefs.quiet.start}
                  onChange={(e) =>
                    set("quiet", { ...prefs.quiet, start: e.target.value })
                  }
                  disabled={!prefs.quiet.enabled}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm disabled:opacity-60 dark:border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  End
                </label>
                <input
                  type="time"
                  value={prefs.quiet.end}
                  onChange={(e) =>
                    set("quiet", { ...prefs.quiet, end: e.target.value })
                  }
                  disabled={!prefs.quiet.enabled}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm disabled:opacity-60 dark:border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={save}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save changes
        </button>
        <button
          onClick={reset}
          className="rounded-xl border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
        >
          Reset defaults
        </button>
      </div>
    </div>
  );
}
