import Link from "next/link";

type Item = { title: string; href: string };

export default function FaqSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white dark:bg-black dark:border-white/10">
      <h3 className="px-5 pt-4 pb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <div className="mx-5 border-t border-gray-200 dark:border-white/10" />
      <ul className="p-2">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="flex items-center justify-between rounded-md px-3 py-3 text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5"
            >
              <span className="text-[15px]">{it.title}</span>
              <span className="text-sky-600 dark:text-sky-400">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
