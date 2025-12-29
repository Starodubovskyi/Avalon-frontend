"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const DARK_URL =
  "https://image.fonwall.ru/o/pe/sea-ocean-night-ship.jpeg?auto=compress&fit=crop&w=1920&h=1080&domain=img3.fonwall.ru";

const LIGHT_URL =
  "https://images.pexels.com/photos/35209830/pexels-photo-35209830.jpeg";

export default function BgImage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const url = resolvedTheme === "light" ? LIGHT_URL : DARK_URL;

  return (
    <div
      className={`absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-500 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundImage: `url('${url}')` }}
      aria-hidden
    />
  );
}
