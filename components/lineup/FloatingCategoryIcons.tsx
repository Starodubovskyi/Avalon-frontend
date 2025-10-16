"use client";

import { Droplet, Sprout, Leaf, FlaskConical, Flame } from "lucide-react";

export default function FloatingCategoryIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <style jsx>{`
        @keyframes floatA {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes floatB {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(12px);
          }
        }
      `}</style>

      <IconWrap className="left-[15%] top-[35%] opacity-[0.12]" variant="A">
        <Droplet />
      </IconWrap>
      <IconWrap className="left-[30%] top-[55%] opacity-[0.08]" variant="B">
        <Sprout />
      </IconWrap>
      <IconWrap className="left-[50%] top-[30%] opacity-[0.10]" variant="A">
        <FlaskConical />
      </IconWrap>
      <IconWrap className="left-[68%] top-[58%] opacity-[0.09]" variant="B">
        <Leaf />
      </IconWrap>
      <IconWrap className="left-[82%] top-[40%] opacity-[0.11]" variant="A">
        <Flame />
      </IconWrap>
    </div>
  );
}

function IconWrap({
  children,
  className,
  variant = "A",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "A" | "B";
}) {
  const anim =
    variant === "A"
      ? "floatA 7s ease-in-out infinite"
      : "floatB 9s ease-in-out infinite";
  return (
    <div
      className={`absolute -z-10 rounded-3xl p-4 blur-[0.3px] ${className}`}
      style={{ animation: anim }}
    >
      <div className="h-12 w-12 text-white/80 drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        {children && <div className="[&>*]:h-12 [&>*]:w-12">{children}</div>}
      </div>
    </div>
  );
}
