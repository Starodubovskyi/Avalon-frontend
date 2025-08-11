"use client";

import { useEffect, useState } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


function useFade(showForMs = 2500, fadeMs = 950) {
  const [visible, setVisible] = useState(true);
  const [render, setRender] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), showForMs);
    const t2 = setTimeout(() => setRender(false), showForMs + fadeMs);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showForMs, fadeMs]);

  return { render, fade: visible };
}

export default function LoaderRadar() {
  const { render, fade } = useFade(2500, 950);

  if (!render) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black
        transition-opacity duration-[950ms] ease-[cubic-bezier(.42,1.2,.44,1)]
        ${fade ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className="transition-all duration-[1250ms] ease-[cubic-bezier(.32,1.35,.38,1)]"
        style={{
          width: 460,
          height: 460,
          filter: "drop-shadow(0 0 36px #32e1e799)",
          transform: fade ? "scale(1)" : "scale(0.93)",
          opacity: fade ? 1 : 0.76,
        }}
      >
        <DotLottieReact
          src="https://lottie.host/dd7a6278-5920-485e-9655-98e568f9c2cf/nCu1xckBOA.lottie"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <span className={`
        mt-8 text-cyan-100/80 text-lg tracking-wider select-none font-mono
        transition-opacity duration-[1150ms] ease-[cubic-bezier(.46,1.2,.44,1)]
        ${fade ? "opacity-100" : "opacity-0"}
      `}>
        Scanning for ships...
      </span>
    </div>
  );
}
