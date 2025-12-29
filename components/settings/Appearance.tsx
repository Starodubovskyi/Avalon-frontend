"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Monitor, Moon, Sun, Palette } from "lucide-react";

// --- ЛОГИКА ---
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
        /* @ts-ignore */
        mql.addListener(handler);
        return () => {
          /* @ts-ignore */
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

  const CARD_CLASS =
    "rounded-[2rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm p-6 sm:p-8";
  const GRADIENT_BG =
    "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Theme */}
      <section className={CARD_CLASS}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Monitor className="text-blue-500" /> Theme
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as Theme)}
              className={clsx(
                "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all",
                theme === t.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md ring-1 ring-blue-500"
                  : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10"
              )}
            >
              <t.icon size={24} />
              <span className="font-bold text-sm">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Accent & Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className={CARD_CLASS}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Palette className="text-purple-500" /> Accent
          </h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={clsx(
                  "w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110",
                  accent === c &&
                    "ring-2 ring-offset-2 ring-gray-400 dark:ring-white"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-white/20">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Live Preview
            </p>
            <div className="flex gap-3 items-center">
              <button
                className="px-4 py-2 rounded-full font-bold text-sm shadow-md transition-transform active:scale-95"
                style={{ background: accent, color: accentText }}
              >
                Button
              </button>
              <span
                className="font-bold underline cursor-pointer"
                style={{ color: accent }}
              >
                Link Text
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 dark:bg-white/20">
                Badge
              </span>
            </div>
          </div>
        </section>

        {/* Density */}
        <section className={CARD_CLASS}>
          <h2 className="text-xl font-bold mb-6">Density</h2>
          <div className="space-y-3">
            {(["comfortable", "compact"] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={clsx(
                  "w-full text-left px-5 py-3 rounded-2xl border transition-all flex items-center justify-between",
                  density === d
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                    : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <span
                  className={clsx(
                    "font-bold capitalize",
                    density === d
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-200"
                  )}
                >
                  {d}
                </span>
                {density === d && (
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Controls padding in data tables and lists.
          </p>
        </section>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={resetDefaults}
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 transition"
        >
          Reset
        </button>
        <button
          onClick={save}
          className={clsx(
            "rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-transform",
            GRADIENT_BG
          )}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
