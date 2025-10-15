"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const variants: Variants = {
  hidden: { opacity: 0, y: -10, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 480, damping: 28 },
  },
  exit: {
    opacity: [1, 1, 1, 0],
    y: [0, -4, 12, 60],
    rotate: [0, 4, -4, 8],
    transition: { duration: 0.6, ease: "easeIn", times: [0, 0.15, 0.35, 1] },
  },
};

export default function StickyNote({
  children,
  className,
  onRemoveComplete,
  onOpen,
}: {
  children: React.ReactNode;
  className?: string;
  onRemoveComplete?: () => void;
  onOpen?: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <AnimatePresence mode="wait" onExitComplete={onRemoveComplete}>
      {!removing && (
        <motion.div
          className={`
            relative w-full min-w-0 rounded-lg border p-2 pt-5
            bg-gray-100 text-gray-800 border-gray-200 shadow-sm
            dark:bg-white/[0.06] dark:text-gray-100 dark:border-white/10
            ${className || ""}
          `}
          style={{ transformOrigin: "top center" }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          layout
          onClick={() => (onOpen ? onOpen() : setExpanded((v) => !v))}
          title={expanded ? "Click to collapse" : "Click to expand"}
        >
          <div className="absolute left-1/2 top-0 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-300 bg-gray-200 shadow-sm dark:border-white/20 dark:bg-white/20" />
          <div
            className={
              expanded
                ? "whitespace-pre-wrap break-all"
                : "line-clamp-2 whitespace-pre-wrap break-all"
            }
          >
            {children}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setRemoving(true);
            }}
            className="absolute right-1 top-0.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            title="Delete"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
