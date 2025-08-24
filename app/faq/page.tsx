import FaqHero from "@/components/support/FaqHero";
import Breadcrumbs from "@/components/support/Breadcrumbs";
import FaqSection from "@/components/support/FaqSection";
import ChatBot from "@/components/Bot/ChatBot";

const featured = {
  title: "How to contact Avalon Ship support team",
  href: "/support/contact",
};

const sections = [
  {
    title: "Payments",
    items: [
      { title: "Billing and Payment Methods", href: "/faq/payments/billing-and-methods" },
      { title: "How can I change my payment method?", href: "/faq/payments/change-method" },
      { title: "What can I do if my payment is declined?", href: "/faq/payments/declined" },
      { title: "What are the available payment methods?", href: "/faq/payments/available-methods" },
    ],
  },
  {
    title: "Account & Access",
    items: [
      { title: "Reset password and recover access", href: "/faq/account/reset-password" },
      { title: "Enable two-factor authentication", href: "/faq/account/2fa" },
      { title: "Manage teams and roles", href: "/faq/account/teams" },
    ],
  },
  {
    title: "Map & Tracking",
    items: [
      { title: "Why a vessel is missing on the map?", href: "/faq/map/missing-vessel" },
      { title: "How to use filters and layers", href: "/faq/map/filters-layers" },
      { title: "Set up alerts and notifications", href: "/faq/map/alerts" },
    ],
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <FaqHero />
      <ChatBot/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: "All Collections", href: "/support" }, { label: "FAQ and Troubleshooting" }]} />
        <div className="mt-6 flex items-start gap-3">
          <div className="rounded-lg border border-gray-200 p-2 text-sky-600 dark:border-white/10 dark:text-sky-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7a2 2 0 0 1 2-2h6l4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.6"/><path d="M12 5v4h4" stroke="currentColor" strokeWidth="1.6"/></svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">FAQ and Troubleshooting</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Find answers to all your questions</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex -space-x-2">
                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white dark:border-black bg-gray-200 dark:bg-gray-700 text-[11px] font-semibold">V</div>
                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white dark:border-black bg-gray-200 dark:bg-gray-700 text-[11px] font-semibold">A</div>
              </div>
              <span>By Vasilis and 1 other • 36 articles</span>
            </div>
          </div>
        </div>

        <a
          href={featured.href}
          className="mt-6 block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition dark:bg-black dark:border-white/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-gray-900 dark:text-gray-100">{featured.title}</span>
            <span className="text-sky-600 dark:text-sky-400">›</span>
          </div>
        </a>

        <div className="mt-6 space-y-6">
          {sections.map((s) => (
            <FaqSection key={s.title} title={s.title} items={s.items} />
          ))}
        </div>
      </div>
    </main>
  );
}
