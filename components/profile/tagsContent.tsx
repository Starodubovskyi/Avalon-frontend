const TagsContent = () => {
  const tags = ["React", "Next.js", "Tailwind", "Dashboard", "UX", "API"];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Popular Tags</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsContent;
