import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface StickyNoteProps {
  children: React.ReactNode;
  className?: string;
  onRemoveComplete?: () => void;
}

const variants: Variants = {
  hidden: { opacity: 0, y: -50, rotate: -5 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 500, damping: 25 }
  },
  exit: {
    opacity: [1, 1, 1, 0],
    y: [0, -4, 8, 60],
    rotate: [0, 8, -8, 12],
    transition: {
      duration: 0.7,
      ease: "easeIn" as const,
      times: [0, 0.15, 0.35, 1]
    }
  }
};

const StickyNote: React.FC<StickyNoteProps> = ({ children, className, onRemoveComplete }) => {
  const [removing, setRemoving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const startRemoval = () => setRemoving(true);

  return (
    <AnimatePresence mode="wait" onExitComplete={onRemoveComplete}>
      {!removing && (
        <motion.div
          className={`
            relative p-2 pt-5 sm:p-4 sm:pt-6 rounded-lg shadow-lg
            bg-yellow-200 text-gray-800
            dark:bg-yellow-800 dark:text-gray-100
            ${className || ""}
            w-full min-w-0
            flex items-center
            transition-all
          `}
          style={{ transformOrigin: "top center" }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          layout
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-3 h-3 sm:w-5 sm:h-5 bg-gray-300 dark:bg-gray-600 rounded-full shadow-md border border-gray-400 dark:border-gray-700 z-20"
          />
          <div
            className={`
              flex-1 cursor-pointer select-text transition-all
              ${expanded ? "whitespace-pre-wrap break-all" : "line-clamp-2 whitespace-pre-wrap break-all"}
              hover:opacity-80
            `}
            title={expanded ? "Click to collapse" : "Click to expand"}
            onClick={() => setExpanded(v => !v)}
          >
            {children}
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              startRemoval();
            }}
            className="absolute top-0.5 right-1 text-base sm:text-xl text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 z-30"
            title="Delete"
          >
            &#10005;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyNote;
