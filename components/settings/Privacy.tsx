"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff, UserX, Users, Globe, Lock } from "lucide-react";

const CARD_CLASS =
  "rounded-[2rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm p-6 sm:p-8";
const SELECT_CLASS =
  "w-full rounded-full border-none bg-gray-100/50 dark:bg-white/10 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer";

// --- ЛОГИКА ---
type Audience = "everyone" | "contacts" | "no-one";
type PrivacyPrefs = {
  whoCanMessage: Audience;
  lastSeen: Audience;
  groupInvites: Audience;
  readReceipts: boolean;
  typingIndicators: boolean;
  blocked: string[];
};
const LS_KEY = "avalon.privacy.v1";
const DEFAULTS: PrivacyPrefs = {
  whoCanMessage: "everyone",
  lastSeen: "contacts",
  groupInvites: "contacts",
  readReceipts: true,
  typingIndicators: true,
  blocked: ["spammer_123"],
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
function isValidUsername(v: string) {
  return /^[a-z0-9_\.]{3,32}$/i.test(v);
}
function normalizeUser(v: string) {
  return v.trim().toLowerCase();
}

export default function Privacy() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULTS);
  const [newBlock, setNewBlock] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PrivacyPrefs;
        setPrefs({ ...DEFAULTS, ...parsed });
      }
    } catch {}
  }, []);
  const filteredBlocked = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = prefs.blocked;
    return query ? list.filter((u) => u.includes(query)) : list;
  }, [prefs.blocked, q]);
  function set<K extends keyof PrivacyPrefs>(k: K, v: PrivacyPrefs[K]) {
    setPrefs((p) => ({ ...p, [k]: v }));
  }
  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
    alert("Privacy settings saved.");
  }
  function resetDefaults() {
    if (!confirm("Reset privacy settings to defaults?")) return;
    setPrefs(DEFAULTS);
    localStorage.setItem(LS_KEY, JSON.stringify(DEFAULTS));
  }
  function addBlock() {
    const raw = newBlock.trim();
    if (!raw) return;
    if (!isValidUsername(raw)) {
      alert("Use 3–32 characters: letters, numbers, underscore or dot.");
      return;
    }
    const v = normalizeUser(raw);
    if (prefs.blocked.includes(v)) {
      alert("User already blocked.");
      return;
    }
    set("blocked", [...prefs.blocked, v]);
    setNewBlock("");
  }
  function removeBlock(u: string) {
    set(
      "blocked",
      prefs.blocked.filter((x) => x !== u)
    );
  }
  function unblockAll() {
    if (!prefs.blocked.length) return;
    if (!confirm("Unblock all users?")) return;
    set("blocked", []);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Audience */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            key: "whoCanMessage",
            label: "Messages",
            icon: <Globe size={18} />,
          },
          { key: "lastSeen", label: "Last Seen", icon: <Eye size={18} /> },
          {
            key: "groupInvites",
            label: "Group Invites",
            icon: <Users size={18} />,
          },
        ].map((item) => (
          <div key={item.key} className={CARD_CLASS}>
            <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
              {item.icon}{" "}
              <span className="text-xs font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <select
              value={prefs[item.key as keyof PrivacyPrefs] as string}
              onChange={(e) =>
                set(item.key as keyof PrivacyPrefs, e.target.value as Audience)
              }
              className={SELECT_CLASS}
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">My Contacts</option>
              <option value="no-one">No One</option>
            </select>
          </div>
        ))}
      </section>

      {/* Toggles */}
      <section className={CARD_CLASS}>
        <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
          <Lock className="text-blue-500" /> Options
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5">
            <div>
              <p className="font-bold text-sm">Read receipts</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                See when messages are read.
              </p>
            </div>
            <Switch
              checked={prefs.readReceipts}
              onChange={(v) => set("readReceipts", v)}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5">
            <div>
              <p className="font-bold text-sm">Typing indicators</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Show when you are typing.
              </p>
            </div>
            <Switch
              checked={prefs.typingIndicators}
              onChange={(v) => set("typingIndicators", v)}
            />
          </div>
        </div>
      </section>

      {/* Blocked */}
      <section className={CARD_CLASS}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserX className="text-red-500" /> Blocked Users
          </h2>
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold">
            {prefs.blocked.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <input
              value={newBlock}
              onChange={(e) => setNewBlock(e.target.value)}
              placeholder="Username to block"
              className="flex-1 rounded-full border-none bg-gray-100/50 dark:bg-white/5 px-4 py-2 text-sm focus:ring-2 focus:ring-red-500/30 outline-none"
            />
            <button
              onClick={addBlock}
              className="rounded-full bg-red-500 text-white px-5 py-2 text-sm font-bold hover:bg-red-600 transition-colors"
            >
              Block
            </button>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search blocked..."
              className="flex-1 rounded-full border-none bg-gray-100/50 dark:bg-white/5 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
            />
            <button
              onClick={unblockAll}
              className="rounded-full border border-red-200 text-red-500 px-4 py-2 text-sm font-bold hover:bg-red-50 dark:border-white/10 dark:hover:bg-white/5 transition-colors"
            >
              Unblock All
            </button>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
          {filteredBlocked.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm italic">
              No users found.
            </div>
          ) : (
            filteredBlocked.map((u) => (
              <div
                key={u}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5"
              >
                <span className="font-mono text-sm ml-2">@{u}</span>
                <button
                  onClick={() => removeBlock(u)}
                  className="px-3 py-1 rounded-full bg-white dark:bg-white/10 text-xs font-bold shadow-sm hover:bg-gray-100 transition-colors"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={resetDefaults}
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
        >
          Reset
        </button>
        <button
          onClick={save}
          className="rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
