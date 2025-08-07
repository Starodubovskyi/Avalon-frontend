"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopProfileNavbar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/profile", label: "Profile" },
    { href: "/companyprofile", label: "Company Profile" },
    { href: "/services", label: "My Online Services" },
    { href: "/subscriptions", label: "My Subscribes" },
  ];

  return (
    <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-600">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 font-medium ${
            pathname === tab.href
              ? "border-b-2 border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
