import CategoryCard from "./CategoryCard";

export type SupportCategory = {
  /** key under support.categories in the messages */
  id: string;
  authors: string[];
  articlesCount: number;
};

export default function CategoriesGrid({ categories }: { categories: SupportCategory[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}
