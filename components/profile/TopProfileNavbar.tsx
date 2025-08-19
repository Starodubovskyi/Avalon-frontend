"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopProfileNavbar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/profile", label: "My Profile" },
    { href: "/companyprofile", label: "Business Profile" },
    { href: "/todo", label: "Tasks" },
    { href: "/billing", label: "Billing" },
    { href: "/notes", label: "Notes" },
    { href: "/subscriptions", label: "Subscriptions" },
    { href: "/services", label: "My Online Sevrvices" },
  ];

  return (
    <div className="w-full">
      <div
        className="
          flex items-center gap-2 overflow-x-auto
          rounded-full border border-gray-200 bg-white px-2 py-2
          dark:bg-white/5 dark:border-white/10
        "
      >
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (pathname === "/profile" && tab.href === "/profile");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "whitespace-nowrap px-4 h-9 inline-flex items-center rounded-full text-sm transition-all",
                active
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
