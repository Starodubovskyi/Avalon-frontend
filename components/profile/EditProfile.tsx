"use client";

import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

export default function EditProfile() {
  const inputClass =
    "w-full rounded-full border-none bg-gray-100/50 dark:bg-white/5 px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all";

  return (
    <div className="rounded-[2.5rem] bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
        Edit Profile
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">
            First Name
          </label>
          <input type="text" defaultValue="Eddie" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">
            Last Name
          </label>
          <input
            type="text"
            defaultValue="Lobanovskiy"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">
            Bio
          </label>
          <textarea
            rows={4}
            className={clsx(inputClass, "rounded-3xl")}
            placeholder="Tell us about yourself..."
            defaultValue="Product designer..."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className={clsx(
            "px-8 py-3 rounded-full text-white font-bold shadow-lg active:scale-95 transition-all hover:shadow-blue-500/30",
            GRADIENT_BG
          )}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
