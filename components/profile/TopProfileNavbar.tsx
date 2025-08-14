"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function TopProfileNavbar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/profile", label: "Profile" },
    { href: "/companyprofile", label: "Company Profile" },
    { href: "/services", label: "My Online Services" },
    { href: "/subscriptions", label: "My Subscribes" },
  ];

  return (
    <nav
      className={clsx(
        "border-b border-gray-300 dark:border-gray-600",
        "bg-white/70 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:backdrop-blur"
      )}
    >
      <div
        className={clsx(
          "flex items-center",
          "overflow-x-auto overflow-y-hidden scrollbar-none",
          "snap-x snap-mandatory",
          "px-2 sm:px-3 md:px-4"
        )}
      >
        <div className="flex w-full space-x-2 sm:space-x-3 md:space-x-4 py-2 md:py-3">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "shrink-0 snap-start",
                  "px-3 py-2 md:px-4 md:py-2.5",
                  "text-sm md:text-base font-medium rounded-lg",
                  "transition-colors duration-200",
                  active
                    ? "text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-400/10 border border-blue-200 dark:border-blue-400/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/10 border border-transparent"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
