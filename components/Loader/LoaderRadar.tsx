"use client";

import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Хук для управления таймингами исчезновения
function useFade(showForMs = 3500, fadeMs = 950) {
  const [visible, setVisible] = useState(true);
  const [render, setRender] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), showForMs);
    const t2 = setTimeout(() => setRender(false), showForMs + fadeMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showForMs, fadeMs]);

  return { render, fade: visible };
}

export default function LoaderRadar() {
  const { render, fade } = useFade(3000, 950);

  if (!render) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center
        transition-colors duration-700
        /* Логика темы: белый фон днем, черный ночью */
        bg-white dark:bg-black
        /* Логика исчезновения всего экрана */
        transition-opacity ease-[cubic-bezier(.42,1.2,.44,1)] duration-[950ms]
        ${fade ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className="relative transition-all duration-[1250ms] ease-[cubic-bezier(.32,1.35,.38,1)]"
        style={{
          width: 460,
          height: 460,
          transform: fade ? "scale(1)" : "scale(0.93)",
          opacity: fade ? 1 : 0.76,
        }}
      >
        {/* Свечение: темное синее для светлой темы, неоновое для темной */}
        <div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-blue-500 dark:bg-cyan-500 animate-pulse" />

        <div
          className="relative w-full h-full 
          /* Инверсия цветов для светлой темы, чтобы радар был темным на белом */
          grayscale dark:grayscale-0 
          contrast-125 dark:contrast-100
          brightness-75 dark:brightness-100
          /* Тень: мягкая синяя vs яркая неоновая */
          drop-shadow-[0_0_15px_rgba(37,99,235,0.4)] dark:drop-shadow-[0_0_36px_#32e1e799]
        "
        >
          <DotLottieReact
            src="https://lottie.host/dd7a6278-5920-485e-9655-98e568f9c2cf/nCu1xckBOA.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <span
        className={`
        mt-8 text-lg tracking-widest select-none font-mono uppercase font-bold
        transition-colors duration-500
        /* Цвет текста: темно-синий днем, светлый неон ночью */
        text-slate-700 dark:text-cyan-100/90
        /* Анимация текста */
        transition-opacity duration-[1150ms] ease-[cubic-bezier(.46,1.2,.44,1)]
        ${fade ? "opacity-100" : "opacity-0"}
      `}
      >
        Scanning for ships...
      </span>
    </div>
  );
}
