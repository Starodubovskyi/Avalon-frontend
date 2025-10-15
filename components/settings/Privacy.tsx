"use client";

import { useEffect, useMemo, useState } from "react";

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
    <div className="space-y-8">
      {/* Audience controls */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="mb-2 font-medium">Who can message me</p>
          <select
            value={prefs.whoCanMessage}
            onChange={(e) => set("whoCanMessage", e.target.value as Audience)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="no-one">No one</option>
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Non-contacts will be filtered when set to “My contacts”.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="mb-2 font-medium">Last seen & online</p>
          <select
            value={prefs.lastSeen}
            onChange={(e) => set("lastSeen", e.target.value as Audience)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="no-one">No one</option>
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Hides your online status and “last seen” accordingly.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="mb-2 font-medium">Group invites</p>
          <select
            value={prefs.groupInvites}
            onChange={(e) => set("groupInvites", e.target.value as Audience)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="no-one">No one</option>
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Who can add you to groups or channels.
          </p>
        </div>
      </section>

      {/* Simple toggles */}
      <section className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
        <h2 className="mb-3 text-lg font-medium">Privacy options</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-white/10">
            <div>
              <p className="font-medium">Read receipts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow others to see when you’ve read their messages.
              </p>
            </div>
            <Switch
              checked={prefs.readReceipts}
              onChange={(v) => set("readReceipts", v)}
              label="Toggle read receipts"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-white/10">
            <div>
              <p className="font-medium">Typing indicators</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Show “typing…” to others while you type.
              </p>
            </div>
            <Switch
              checked={prefs.typingIndicators}
              onChange={(v) => set("typingIndicators", v)}
              label="Toggle typing indicators"
            />
          </div>
        </div>
      </section>

      {/* Blocked users */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium">Blocked users</p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {prefs.blocked.length} total
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 flex gap-2">
            <input
              value={newBlock}
              onChange={(e) => setNewBlock(e.target.value)}
              placeholder="username"
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
            />
            <button
              onClick={addBlock}
              className="rounded-xl px-4 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              Block
            </button>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search blocked…"
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
            />
            <button
              onClick={unblockAll}
              className="rounded-xl px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/10"
            >
              Unblock all
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 divide-y dark:divide-white/10 dark:border-white/10">
          {filteredBlocked.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
              {prefs.blocked.length
                ? "No users match your search."
                : "No blocked users."}
            </div>
          ) : (
            filteredBlocked.map((u) => (
              <div key={u} className="flex items-center justify-between p-4">
                <span className="font-mono">@{u}</span>
                <button
                  onClick={() => removeBlock(u)}
                  className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex gap-2">
        <button
          onClick={save}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save changes
        </button>
        <button
          onClick={resetDefaults}
          className="rounded-xl border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
        >
          Reset defaults
        </button>
      </div>
    </div>
  );
}
