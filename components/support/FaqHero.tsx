import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Item = { title: string; href: string };

export default function FaqSection({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  return (
    <section className="rounded-[2rem] border border-gray-200/50 dark:border-white/5 bg-white/60 dark:bg-[#161b22]/60 backdrop-blur-md shadow-sm overflow-hidden">
      <h3 className="px-8 pt-6 pb-4 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="border-t border-gray-100 dark:border-white/5" />
      <ul className="divide-y divide-gray-100 dark:divide-white/5">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="flex items-center justify-between px-8 py-5 text-gray-700 hover:bg-blue-50/50 dark:text-gray-200 dark:hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {it.title}
              </span>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-blue-500 transition-colors"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
