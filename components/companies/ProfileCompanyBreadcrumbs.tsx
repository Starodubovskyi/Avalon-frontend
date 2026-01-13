"use client";

import Link from "next/link";
import clsx from "clsx";

type Crumb = { label: string; href?: string };

export default function ProfileCompanyBreadcrumbs({
  items,
  className = "",
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        "mb-6 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400",
        className
      )}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wide text-xs"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={clsx(
                    "uppercase tracking-wide text-xs truncate max-w-[200px]",
                    isLast ? "font-bold text-gray-900 dark:text-white" : ""
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className="mx-2 text-gray-300 dark:text-gray-600 select-none">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
