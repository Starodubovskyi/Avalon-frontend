"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function TopProfileNavbar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/profile", label: "My Profile" },
    { href: "/companyprofile", label: "Business Profile" },
    { href: "/tasks", label: "Tasks" },
    { href: "/billing", label: "Billing" },
    { href: "/subscriptions", label: "Subscriptions" },
    { href: "/services", label: "My Online Sevrvices" },
  ];

  const isActive = (href: string) =>
    pathname === href || (pathname === "/profile" && href === "/profile");

  return (
    <div className="w-full">
      <div
        className="
          relative flex items-center gap-2 overflow-x-auto
          rounded-full border border-gray-200 bg-white px-2 py-2
          dark:bg-white/5 dark:border-white/10
        "
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={[
                "relative isolate whitespace-nowrap px-4 h-9 inline-flex items-center rounded-full text-sm transition-all",
                active
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100",
              ].join(" ")}
            >
              {active && (
                <motion.span
                  layoutId="topProfileTabsHighlight"
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 38,
                    mass: 0.3,
                  }}
                  className="
                    absolute inset-0 -z-10 rounded-full
                    bg-blue-50 shadow-sm ring-1 ring-inset ring-blue-200
                    dark:bg-blue-900/30 dark:ring-blue-900/50
                  "
                />
              )}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
