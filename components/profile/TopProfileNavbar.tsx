"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

// Градиент текста для активного таба
const GRADIENT_TEXT =
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent";

export default function TopProfileNavbar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/account", label: "My Profile" },
    { href: "/companies", label: "Companies" },
    { href: "/tasks", label: "Tasks" },
    { href: "/billing", label: "Billing" },
    { href: "/subscriptions", label: "Subscriptions" },
    { href: "/services", label: "My Online Services" },
  ];

  const isActive = (href: string) =>
    pathname === href;

  return (
    <div className="w-full mb-8">
      <div
        className="
          relative flex items-center gap-1 overflow-x-auto
          rounded-full border border-gray-200 bg-white/80 backdrop-blur-xl p-1.5
          dark:bg-[#0d1117]/80 dark:border-white/5 shadow-sm no-scrollbar
        "
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "relative isolate whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all z-10",
                active
                  ? "text-blue-600 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {active && (
                <motion.span
                  layoutId="topProfileTabsHighlight"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="
                    absolute inset-0 -z-10 rounded-full
                    bg-white dark:bg-[#1e2329] shadow-md
                    border border-gray-100 dark:border-white/5
                  "
                />
              )}
              <span className={active ? GRADIENT_TEXT : ""}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
