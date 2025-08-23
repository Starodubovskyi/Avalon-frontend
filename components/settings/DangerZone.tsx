"use client";

export default function DangerZone() {
  function deactivate() {
    if (confirm("Deactivate your account? You can reactivate later by logging in.")) {
      alert("Account deactivated.");
    }
  }

  function deleteAccount() {
    const first = confirm("This will permanently delete your account. Continue?");
    if (!first) return;
    const second = prompt('Type "DELETE" to confirm:');
    if (second === "DELETE") {
      alert("Account deleted.");
    } else {
      alert("Confirmation failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-300/60 bg-red-50 p-4 dark:border-red-500/40 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Danger Zone</h3>
        <p className="text-sm text-red-700/90 dark:text-red-200/80 mt-1">
          Actions here are destructive. Proceed with caution.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-200/60 p-4 dark:border-red-500/30">
            <p className="font-medium mb-2">Deactivate account</p>
            <p className="text-sm text-red-700/90 dark:text-red-200/80 mb-3">
              Temporarily disable your account. You can reactivate by logging back in.
            </p>
            <button
              onClick={deactivate}
              className="rounded-xl px-4 py-2 border border-red-300/60 text-red-800 hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              Deactivate
            </button>
          </div>

          <div className="rounded-xl border border-red-200/60 p-4 dark:border-red-500/30">
            <p className="font-medium mb-2">Delete account</p>
            <p className="text-sm text-red-700/90 dark:text-red-200/80 mb-3">
              Permanently remove your account and all associated data.
            </p>
            <button
              onClick={deleteAccount}
              className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
