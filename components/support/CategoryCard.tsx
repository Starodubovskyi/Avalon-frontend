import Link from "next/link";
import { IconFolder } from "@tabler/icons-react";

type Category = {
  id: string;
  title: string;
  description: string;
  authors: string[];
  authorsCount: number;
  articlesCount: number;
};

function AvatarStack({ initials }: { initials: string[] }) {
  return (
    <div className="flex -space-x-2">
      {initials.slice(0, 3).map((it, i) => (
        <div
          key={i}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white dark:border-black bg-gray-200 dark:bg-gray-700 text-[11px] font-semibold text-gray-700 dark:text-gray-100"
        >
          {it}
        </div>
      ))}
    </div>
  );
}

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/support/${category.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-black"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-gray-200 p-2 text-sky-600 dark:border-white/10 dark:text-sky-400">
          <IconFolder size={22} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{category.title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <AvatarStack initials={category.authors} />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {category.authorsCount} authors • {category.articlesCount} articles
        </div>
      </div>
    </Link>
  );
}
