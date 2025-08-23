"use client";

import {useEffect, useRef, useState, useMemo} from "react";
import Script from "next/script";

type Effect =
  | "waves" | "fog" | "net" | "birds" | "cells" | "clouds" | "halo" | "rings";

type Props = {
  /** какой эффект Vanta использовать */
  effect?: Effect;
  /** опции Vanta: color, shininess, waveHeight, mouseControls и т.д. */
  options?: Record<string, any>;
  /** класс контейнера (по умолчанию фон на весь экран под контентом) */
  className?: string;
};

export default function VantaCDN({
  effect = "waves",
  options = {},
  className = "fixed inset-0 -z-10",
}: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<any>(null);
  const [threeReady, setThreeReady] = useState(false);
  const [vantaReady, setVantaReady] = useState(false);

  const vantaUrl = useMemo(() => {
    // можно зафиксировать версию (например v0.5.24), но latest тоже ок
    return `https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.${effect}.min.js`;
  }, [effect]);

  useEffect(() => {
    // уважаем настройку «меньше анимаций»
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (!elRef.current || !threeReady || !vantaReady || prefersReduced) return;
    const w = window as any;

    // VANTA.WAVES / VANTA.FOG ... — ключ всегда в UPPERCASE
    const key = effect.toUpperCase();
    const ctor = w?.VANTA?.[key];

    if (ctor && !vantaRef.current) {
      vantaRef.current = ctor({
        el: elRef.current,
        THREE: w?.THREE,
        // безопасные дефолты
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        // твои опции переопределяют дефолты
        ...options,
      });
    }

    return () => {
      // корректный cleanup при размонтировании/навигации
      try {
        vantaRef.current?.destroy?.();
      } catch {}
      vantaRef.current = null;
    };
  }, [threeReady, vantaReady, effect, options]);

  return (
    <>
      {/* контейнер под фон */}
      <div ref={elRef} className={className} />

      {/* THREE.js */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={() => setThreeReady(true)}
      />
      {/* Vanta эффект */}
      <Script
        src={vantaUrl}
        strategy="afterInteractive"
        onLoad={() => setVantaReady(true)}
      />
    </>
  );
}
