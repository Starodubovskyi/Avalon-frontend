"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  Bell,
  Mail,
  AppWindow,
  MessageSquare,
  Users,
  Settings,
  Megaphone,
} from "lucide-react";

// Стили
const CARD_CLASS =
  "rounded-[2rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm p-6 sm:p-8";
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

// --- ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ) ---
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
      className={clsx(
        "relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300",
        checked ? "bg-blue-600" : "bg-gray-300 dark:bg-white/10",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      {" "}
      <span
        className={clsx(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />{" "}
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

  const channelIcons = { push: Bell, email: Mail, inApp: AppWindow };
  const typeIcons = {
    messages: MessageSquare,
    followers: Users,
    system: Settings,
    marketing: Megaphone,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Channels */}
      <section className={CARD_CLASS}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Channels</h2>
          <button
            onClick={testNotification}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Send test
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["push", "email", "inApp"] as const).map((c) => {
            const Icon = channelIcons[c];
            return (
              <div
                key={c}
                className="flex flex-col items-start justify-between rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 p-5 border border-gray-100 dark:border-white/5 h-full"
              >
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mb-3 shadow-sm text-gray-700 dark:text-white">
                    <Icon size={20} />
                  </div>
                  <p className="font-bold capitalize text-lg">
                    {c === "inApp" ? "In-app" : c}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {c === "inApp"
                      ? "Show popups inside the app interface"
                      : `Send notifications via ${c}`}
                  </p>
                </div>
                <Switch
                  checked={prefs.channels[c]}
                  onChange={(v) =>
                    set("channels", { ...prefs.channels, [c]: v })
                  }
                />
              </div>
            );
          })}
        </div>
        {preview && prefs.channels.inApp && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Bell size={16} />
            </div>
            <div>
              <div className="font-bold text-sm text-blue-900">
                In-app notification
              </div>
              <div className="text-xs text-blue-700">
                This is a test notification preview.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Types */}
      <section className={CARD_CLASS}>
        <h2 className="mb-6 text-xl font-bold">Notify me about</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["messages", "followers", "system", "marketing"] as const).map(
            (t) => {
              const Icon = typeIcons[t];
              return (
                <label
                  key={t}
                  className="flex items-center justify-between rounded-2xl bg-gray-50/50 dark:bg-white/5 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-gray-400" size={20} />
                    <span className="capitalize font-medium">{t}</span>
                  </div>
                  <Switch
                    checked={prefs.types[t]}
                    onChange={(v) => set("types", { ...prefs.types, [t]: v })}
                  />
                </label>
              );
            }
          )}
        </div>
      </section>

      {/* Options */}
      <section className={CARD_CLASS}>
        <h2 className="mb-6 text-xl font-bold">Preferences</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Digest */}
          <div className="rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 p-5">
            <div className="font-bold text-sm mb-3">Email Digest</div>
            <div className="flex bg-white dark:bg-black/20 p-1 rounded-full border border-gray-100 dark:border-white/5 mb-4">
              {(["instant", "daily"] as Digest[]).map((d) => (
                <button
                  key={d}
                  onClick={() => set("digest", d)}
                  className={clsx(
                    "flex-1 py-1.5 rounded-full text-xs font-bold transition-all",
                    prefs.digest === d
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Time
              </span>
              <input
                type="time"
                value={prefs.emailTime}
                onChange={(e) => set("emailTime", e.target.value)}
                disabled={prefs.digest !== "daily"}
                className="flex-1 rounded-full border-none bg-white dark:bg-white/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-sm">Quiet Hours</div>
              <Switch
                checked={prefs.quiet.enabled}
                onChange={(v) => set("quiet", { ...prefs.quiet, enabled: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-2 block mb-1">
                  Start
                </label>
                <input
                  type="time"
                  value={prefs.quiet.start}
                  onChange={(e) =>
                    set("quiet", { ...prefs.quiet, start: e.target.value })
                  }
                  disabled={!prefs.quiet.enabled}
                  className="w-full rounded-full border-none bg-white dark:bg-white/10 px-3 py-2 text-sm outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-2 block mb-1">
                  End
                </label>
                <input
                  type="time"
                  value={prefs.quiet.end}
                  onChange={(e) =>
                    set("quiet", { ...prefs.quiet, end: e.target.value })
                  }
                  disabled={!prefs.quiet.enabled}
                  className="w-full rounded-full border-none bg-white dark:bg-white/10 px-3 py-2 text-sm outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={reset}
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 transition"
        >
          Reset
        </button>
        <button
          onClick={save}
          className={clsx(
            "rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform",
            GRADIENT_BG
          )}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
