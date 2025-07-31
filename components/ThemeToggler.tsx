"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";

interface ThemeTogglerProps {
  className?: string;
}

const ThemeToggler: React.FC<ThemeTogglerProps> = ({ className }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={clsx(
        "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
        "hover:bg-muted hover:text-primary",
        "bg-transparent text-muted-foreground",
        className
      )}
    >
      <span className="sr-only">Toggle Theme</span>
      <div className="relative w-6 h-6">
        <Sun
          className={clsx(
            "absolute inset-0 transition-opacity duration-300",
            isDark ? "opacity-0" : "opacity-100"
          )}
        />
        <Moon
          className={clsx(
            "absolute inset-0 transition-opacity duration-300",
            isDark ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </button>
  );
};

export default ThemeToggler;
