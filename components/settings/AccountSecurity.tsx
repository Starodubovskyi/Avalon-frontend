"use client";

import { useState } from "react";

type Session = {
  id: string;
  device: string;
  ip: string;
  city?: string;
  lastActive: string;
  current?: boolean;
};

export default function AccountSecurity() {
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    { id: "1", device: "Chrome • Windows", ip: "81.23.10.2", city: "Bucharest", lastActive: "Today, 11:22", current: true },
    { id: "2", device: "Safari • iPhone", ip: "81.23.10.2", city: "Galați", lastActive: "Aug 18, 21:03" },
  ]);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  function revokeSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    alert("Session revoked.");
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!oldPass || !newPass) return alert("Fill all fields.");
    if (newPass !== confirmPass) return alert("Passwords do not match.");
    if (newPass.length < 8) return alert("New password must be at least 8 characters.");
    setOldPass(""); setNewPass(""); setConfirmPass("");
    alert("Password changed.");
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Two-Factor Authentication</h2>
        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <div>
            <p className="font-medium">Enable 2FA</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Increase account security with one-time codes.</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={twoFA}
              onChange={(e) => setTwoFA(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 after:transition"></div>
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Change Password</h2>
        <form onSubmit={changePassword} className="grid gap-3 sm:grid-cols-3">
          <input
            type="password"
            placeholder="Current password"
            className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="New password"
            className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Save password
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Active Sessions</h2>
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-white/10 dark:border-white/10">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {s.device} {s.current ? <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">current</span> : null}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  IP {s.ip} • {s.city || "Unknown"} • Last active: {s.lastActive}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
