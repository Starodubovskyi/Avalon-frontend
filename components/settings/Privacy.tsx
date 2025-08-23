"use client";

import { useState } from "react";

type Audience = "everyone" | "contacts" | "no-one";

export default function Privacy() {
  const [whoCanMessage, setWhoCanMessage] = useState<Audience>("everyone");
  const [lastSeen, setLastSeen] = useState<Audience>("contacts");
  const [blocked, setBlocked] = useState<string[]>(["spammer_123"]);
  const [newBlock, setNewBlock] = useState("");

  function addBlock() {
    const v = newBlock.trim();
    if (!v) return;
    if (blocked.includes(v)) return alert("User already blocked.");
    setBlocked((p) => [...p, v]);
    setNewBlock("");
  }

  function removeBlock(u: string) {
    setBlocked((p) => p.filter((x) => x !== u));
  }

  function save() {
    alert("Privacy settings saved.");
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="font-medium mb-2">Who can message me</p>
          <select
            value={whoCanMessage}
            onChange={(e) => setWhoCanMessage(e.target.value as Audience)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="no-one">No one</option>
          </select>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="font-medium mb-2">Last seen & online</p>
          <select
            value={lastSeen}
            onChange={(e) => setLastSeen(e.target.value as Audience)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="no-one">No one</option>
          </select>
        </div>
      </section>

      <section>
        <p className="font-medium mb-2">Blocked users</p>
        <div className="flex gap-2 mb-3">
          <input
            value={newBlock}
            onChange={(e) => setNewBlock(e.target.value)}
            placeholder="username"
            className="flex-1 rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
          />
          <button onClick={addBlock} className="rounded-xl px-4 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
            Block
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 divide-y dark:divide-white/10 dark:border-white/10">
          {blocked.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No blocked users.</div>
          ) : (
            blocked.map((u) => (
              <div key={u} className="flex items-center justify-between p-4">
                <span>@{u}</span>
                <button onClick={() => removeBlock(u)} className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <button onClick={save} className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
        Save changes
      </button>
    </div>
  );
}
