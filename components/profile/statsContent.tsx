const StatsContent = () => {
  const stats = [
    { label: "Total Views", value: "12,439" },
    { label: "New Users", value: "328" },
    { label: "Bounce Rate", value: "32%" },
    { label: "Avg. Session", value: "03:25" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Site Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-md bg-gray-100 dark:bg-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsContent;
