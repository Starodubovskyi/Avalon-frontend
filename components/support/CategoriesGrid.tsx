import CategoryCard from "./CategoryCard";

type Category = {
  id: string;
  title: string;
  description: string;
  authors: string[];
  authorsCount: number;
  articlesCount: number;
};

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}
