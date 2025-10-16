"use client";

import { useEffect, useMemo, useState } from "react";

type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact";

const LS_KEY = "app:appearance";
const DEFAULTS = {
  theme: "system" as Theme,
  accent: "#2563eb",
  density: "comfortable" as Density,
};

const ACCENT_PRESETS = [
  "#2563eb",
  "#16a34a",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

function cls(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

function setDarkClass(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  (root.style as any).colorScheme = isDark ? "dark" : "light";
}

function ensureThemeColorMeta(): HTMLMetaElement {
  let el = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.name = "theme-color";
    document.head.appendChild(el);
  }
  return el;
}

function getTextOn(bgHex: string) {
  const hex = bgHex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.55 ? "#000000" : "#ffffff";
}

export default function Appearance() {
  const [theme, setTheme] = useState<Theme>(DEFAULTS.theme);
  const [accent, setAccent] = useState<string>(DEFAULTS.accent);
  const [density, setDensity] = useState<Density>(DEFAULTS.density);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          theme: Theme;
          accent: string;
          density: Density;
        };
        setTheme(parsed.theme ?? DEFAULTS.theme);
        setAccent(parsed.accent ?? DEFAULTS.accent);
        setDensity(parsed.density ?? DEFAULTS.density);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      if (theme === "dark") setDarkClass(true);
      else if (theme === "light") setDarkClass(false);
      else setDarkClass(mql.matches);
    };

    apply();

    if (theme === "system") {
      const handler = () => setDarkClass(mql.matches);
      if ("addEventListener" in mql) {
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
      } else {
        // @ts-ignore
        mql.addListener(handler);
        return () => {
          // @ts-ignore
          mql.removeListener(handler);
        };
      }
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    const meta = ensureThemeColorMeta();
    meta.content = accent;
  }, [accent]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify({ theme, accent, density }));
    alert("Appearance saved.");
  }

  function resetDefaults() {
    setTheme(DEFAULTS.theme);
    setAccent(DEFAULTS.accent);
    setDensity(DEFAULTS.density);
    localStorage.setItem(LS_KEY, JSON.stringify(DEFAULTS));
  }

  const accentText = useMemo(() => getTextOn(accent), [accent]);

  return (
    <div className="space-y-8">
      {/* Theme */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="mb-2 font-medium">Theme</p>
          <div className="flex gap-2">
            {(["system", "light", "dark"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cls(
                  "rounded-xl border px-3 py-2 text-sm capitalize",
                  theme === t
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                    : "border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Мини-превью поверхности/кнопки/ссылки */}
          <div className="mt-4 rounded-lg border border-gray-200 p-3 text-sm dark:border-white/10">
            <div className="mb-2 font-medium">Preview</div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-md px-3 py-1.5 text-sm"
                style={{ background: "var(--accent)", color: accentText }}
              >
                Button
              </button>
              <span className="text-gray-700 underline dark:text-gray-300">
                Link
              </span>
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-white/10">
                Badge
              </span>
            </div>
          </div>
        </div>

        {/* Accent */}
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="mb-2 font-medium">Accent color</p>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-xl"
            aria-label="Pick accent color"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                title={c}
                className={cls(
                  "h-8 w-8 rounded-lg border",
                  accent === c
                    ? "ring-2 ring-offset-2 ring-blue-500"
                    : "hover:opacity-90",
                  "border-gray-200 dark:border-white/10"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Used for highlights and buttons.
          </p>
        </div>

        {/* Density */}
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <p className="mb-2 font-medium">Density</p>
          <div className="flex gap-2">
            {(["comfortable", "compact"] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={cls(
                  "rounded-xl border px-3 py-2 text-sm capitalize",
                  density === d
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                    : "border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Compact reduces paddings for dense data tables.
          </p>
        </div>
      </section>

      <div className="flex gap-2">
        <button
          onClick={save}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save changes
        </button>
        <button
          onClick={resetDefaults}
          className="rounded-xl border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
        >
          Reset defaults
        </button>
      </div>
    </div>
  );
}
