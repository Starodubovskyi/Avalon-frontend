"use client";

import Link from "next/link";

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
      className={[
        "mb-4 sm:mb-6",
        "text-xs sm:text-sm",
        "text-gray-500 dark:text-gray-400",
        className,
      ].join(" ")}
    >
      <ol className="flex items-center gap-1 sm:gap-2 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center max-w-full">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:underline hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="uppercase tracking-wide">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={[
                    "uppercase tracking-wide truncate",
                    isLast
                      ? "font-semibold text-gray-900 dark:text-gray-100"
                      : "",
                  ].join(" ")}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span
                  className="px-2 text-gray-400 dark:text-gray-500 select-none"
                  aria-hidden="true"
                >
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
