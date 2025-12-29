import Link from "next/link";
import { Folder } from "lucide-react";
import clsx from "clsx";

const GRADIENT_ICON =
  "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400";

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
    <div className="flex -space-x-3">
      {initials.slice(0, 3).map((it, i) => (
        <div
          key={i}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-[#161b22] bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-600 dark:text-gray-300 shadow-sm"
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
      className="
        group block h-full rounded-[2rem] p-6 border border-gray-200/50 dark:border-white/5
        bg-white/60 dark:bg-[#161b22]/60 backdrop-blur-md shadow-sm
        hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:bg-white dark:hover:bg-[#1e2329]
        transition-all duration-300
      "
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={clsx(
            "p-3.5 rounded-2xl shrink-0 transition-transform group-hover:scale-110",
            GRADIENT_ICON
          )}
        >
          <Folder size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {category.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-auto border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <AvatarStack initials={category.authors} />
        <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          {category.articlesCount} articles
        </div>
      </div>
    </Link>
  );
}
