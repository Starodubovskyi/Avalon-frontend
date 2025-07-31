const PagesContent = () => {
  const pages = [
    { title: "Home", path: "/", views: 1245 },
    { title: "About Us", path: "/about", views: 942 },
    { title: "Blog", path: "/blog", views: 1673 },
    { title: "Contact", path: "/contact", views: 321 },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Top Pages</h2>
      <ul className="space-y-2">
        {pages.map((page) => (
          <li
            key={page.path}
            className="flex justify-between items-center px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700"
          >
            <div>
              <p className="font-medium">{page.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {page.path}
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {page.views} views
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PagesContent;
