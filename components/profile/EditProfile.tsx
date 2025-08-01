"use client";

export default function EditProfile() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Edit Profile
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
            First Name
          </label>
          <input
            type="text"
            defaultValue="Eddie"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <input
            type="text"
            defaultValue="Lobanovskiy"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            defaultValue="eddie@example.com"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
            Phone
          </label>
          <input
            type="text"
            defaultValue="+44 774 355 020"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Tell us about yourself..."
          >
            Product designer passionate about crypto and clean UI.
          </textarea>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full">
          Save Changes
        </button>
      </div>
    </div>
  );
}
