import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-gray-500 dark:text-gray-400">
      <ol className="flex items-center gap-2">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.href ? (
              <Link href={c.href} className="hover:text-gray-700 dark:hover:text-gray-300">
                {c.label}
              </Link>
            ) : (
              <span className="text-gray-700 dark:text-gray-300">{c.label}</span>
            )}
            {i < items.length - 1 && <span>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
