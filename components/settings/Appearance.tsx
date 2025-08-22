"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact";

export default function Appearance() {
  const [theme, setTheme] = useState<Theme>("system");
  const [accent, setAccent] = useState<string>("#2563eb"); // blue-600
  const [density, setDensity] = useState<Density>("comfortable");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // system — оставляем как есть (предполагаем, что у тебя уже есть переключатель темы)
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  function save() {
    localStorage.setItem("app:appearance", JSON.stringify({ theme, accent, density }));
    alert("Appearance saved.");
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("app:appearance");
      if (raw) {
        const parsed = JSON.parse(raw) as { theme: Theme; accent: string; density: Density };
        setTheme(parsed.theme || "system");
        setAccent(parsed.accent || "#2563eb");
        setDensity(parsed.density || "comfortable");
      }
    } catch {}
  }, []);

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="font-medium mb-2">Theme</p>
          <div className="space-y-2">
            {(["system", "light", "dark"] as Theme[]).map((t) => (
              <label key={t} className="flex items-center justify-between cursor-pointer">
                <span className="capitalize">{t}</span>
                <input
                  type="radio"
                  name="theme"
                  value={t}
                  checked={theme === t}
                  onChange={() => setTheme(t)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="font-medium mb-2">Accent color</p>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="h-10 w-full rounded-xl"
          />
          <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
            Used for highlights and buttons.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="font-medium mb-2">Density</p>
          <div className="space-y-2">
            {(["comfortable", "compact"] as Density[]).map((d) => (
              <label key={d} className="flex items-center justify-between cursor-pointer">
                <span className="capitalize">{d}</span>
                <input
                  type="radio"
                  name="density"
                  value={d}
                  checked={density === d}
                  onChange={() => setDensity(d)}
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      <button onClick={save} className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
        Save changes
      </button>
    </div>
  );
}
