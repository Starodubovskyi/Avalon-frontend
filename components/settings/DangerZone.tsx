"use client";

import { AlertTriangle, Trash2, Power } from "lucide-react";

export default function DangerZone() {
  function deactivate() {
    if (
      confirm(
        "Deactivate your account? You can reactivate later by logging in."
      )
    ) {
      alert("Account deactivated.");
    }
  }

  function deleteAccount() {
    const first = confirm(
      "This will permanently delete your account. Continue?"
    );
    if (!first) return;
    const second = prompt('Type "DELETE" to confirm:');
    if (second === "DELETE") {
      alert("Account deleted.");
    } else {
      alert("Confirmation failed.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-[2.5rem] border border-red-200 bg-red-50/50 p-8 dark:border-red-900/30 dark:bg-red-950/10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-red-900 dark:text-red-200">
            Danger Zone
          </h3>
        </div>
        <p className="text-sm text-red-700/80 dark:text-red-200/70 mb-8 ml-12">
          Actions here are destructive and cannot be undone. Proceed with
          caution.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-[1.5rem] bg-white dark:bg-white/5 border border-red-100 dark:border-red-900/20 p-6 shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 mb-3">
                <Power size={20} />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">
                Deactivate account
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4 leading-relaxed">
                Temporarily disable your account. You can reactivate by logging
                back in at any time.
              </p>
            </div>
            <button
              onClick={deactivate}
              className="w-full rounded-full border border-gray-200 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
            >
              Deactivate
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-[1.5rem] bg-white dark:bg-white/5 border border-red-100 dark:border-red-900/20 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-[4rem] pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
                <Trash2 size={20} />
              </div>
              <p className="font-bold text-red-900 dark:text-red-200">
                Delete account
              </p>
              <p className="text-xs text-red-700/70 dark:text-red-300/70 mt-1 mb-4 leading-relaxed">
                Permanently remove your account and all associated data. This
                action is irreversible.
              </p>
            </div>
            <button
              onClick={deleteAccount}
              className="w-full rounded-full bg-red-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 transition-all"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
