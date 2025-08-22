"use client";

export default function SupportHelp() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">FAQ</h2>
        <div className="space-y-3">
          <details className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
            <summary className="cursor-pointer font-medium">How to contact support?</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Open the support chat from this page or email us at support@example.com.
            </p>
          </details>
          <details className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
            <summary className="cursor-pointer font-medium">How do I export my data?</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              You can request a data export from the support team. Processing usually takes 1–3 days.
            </p>
          </details>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-white/10">
        <div>
          <p className="font-medium">Open Support Chat</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Our assistant will help you solve issues faster.</p>
        </div>
        <a
          href="/support"
          className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Open chat
        </a>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Contact</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <a
            href="mailto:support@example.com"
            className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            support@example.com
          </a>
          <a
            href="https://t.me/your_support"
            target="_blank"
            className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Telegram
          </a>
          <a
            href="/docs"
            className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Documentation
          </a>
        </div>
      </section>
    </div>
  );
}
