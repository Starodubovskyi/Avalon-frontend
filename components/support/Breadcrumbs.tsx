import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.href ? (
              <Link
                href={c.href}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {c.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-semibold">
                {c.label}
              </span>
            )}
            {i < items.length - 1 && (
              <ChevronRight
                size={14}
                className="text-gray-300 dark:text-gray-600"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
