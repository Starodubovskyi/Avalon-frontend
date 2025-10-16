"use client";

import { useEffect, useState } from "react";

export default function ParallaxGlow() {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!mounted) return null;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (pos.x - cx) * 0.03;
  const dy = (pos.y - cy) * 0.03;

  return (
    <>
      <div
        className="pointer-events-none absolute -left-1/3 -top-1/3 -z-10 h-[60vh] w-[60vw] rounded-full
                   bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),rgba(255,255,255,0)_60%)]
                   blur-3xl transition-transform duration-300"
        style={{ transform: `translate3d(${dx}px, ${dy}px, 0)` }}
      />
      <div
        className="pointer-events-none absolute -right-1/4 -bottom-1/4 -z-10 h-[50vh] w-[50vw] rounded-full
                   bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),rgba(16,185,129,0)_60%)]
                   blur-3xl transition-transform duration-300"
        style={{ transform: `translate3d(${-dx}px, ${-dy}px, 0)` }}
      />
    </>
  );
}
