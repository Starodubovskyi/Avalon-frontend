"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, useProjectStore } from "./store/tasks";
import {
  Gauge,
  ListChecks,
  KanbanSquare,
  CalendarDays,
  FolderOpenDot,
  Share2,
  Sparkles,
} from "lucide-react";

type TabKey = "overview" | "list" | "board" | "calendar" | "files";

const TABS: {
  key: TabKey;
  label: string;
  Icon: any;
  badgeOf?: "total" | "inprogress" | "due";
}[] = [
  { key: "overview", label: "Overview", Icon: Gauge },
  { key: "list", label: "List", Icon: ListChecks, badgeOf: "total" },
  { key: "board", label: "Board", Icon: KanbanSquare, badgeOf: "inprogress" },
  { key: "calendar", label: "Calendar", Icon: CalendarDays, badgeOf: "due" },
  { key: "files", label: "Files", Icon: FolderOpenDot },
];

export default function TabsBar({ active }: { active: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const setView = useUIStore((s) => s.setView);
  const tasks = useProjectStore((s) => s.tasks);

  const counts = useMemo(() => {
    const list = Object.values(tasks);
    const total = list.length;
    const inprogress = list.filter((t) => t.status === "inprogress").length;
    const due = list.filter((t) => !!t.dueAt).length;
    return { total, inprogress, due };
  }, [tasks]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeft(scrollLeft > 2);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 2);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = TABS.findIndex((t) => t.key === active);
    if (e.key === "ArrowRight") {
      const next = TABS[(idx + 1) % TABS.length].key;
      setView(next);
    }
    if (e.key === "ArrowLeft") {
      const prev = TABS[(idx - 1 + TABS.length) % TABS.length].key;
      setView(prev);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence initial={false}>
        {showLeft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-0 top-0 h-full w-8 from-white to-transparent dark:from-[#0a0a0a] bg-gradient-to-r"
          />
        )}
        {showRight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-0 top-0 h-full w-8 from-white to-transparent dark:from-[#0a0a0a] bg-gradient-to-l"
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-gray-50/60 p-1 backdrop-blur-sm focus:outline-none dark:border-white/10 dark:bg-white/5"
      >
        <div className="relative flex gap-1">
          {TABS.map((t) => {
            const isActive = active === t.key;
            const badge =
              t.badgeOf === "total"
                ? counts.total
                : t.badgeOf === "inprogress"
                ? counts.inprogress
                : t.badgeOf === "due"
                ? counts.due
                : null;

            return (
              <button
                key={t.key}
                onClick={() => setView(t.key)}
                className={`relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition
                ${
                  isActive
                    ? "text-white dark:text-black"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="tabs-pill"
                    className="absolute inset-0 rounded-xl bg-gray-900 shadow-sm dark:bg-white"
                    transition={{
                      type: "spring",
                      bounce: 0.25,
                      duration: 0.35,
                    }}
                  />
                )}
                <t.Icon className="relative z-10 h-4 w-4 opacity-80" />
                <span className="relative z-10">{t.label}</span>

                {badge !== null && (
                  <span
                    className={`relative z-10 inline-flex items-center justify-center rounded-md px-1.5 text-[11px] leading-5
                    ${
                      isActive
                        ? "bg-white/15 text-white dark:bg-black/10 dark:text-black"
                        : "bg-black/5 text-gray-600 dark:bg-white/10 dark:text-gray-200"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 pr-1">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:shadow dark:bg-white/10 dark:text-gray-100"
            title="Share"
          >
            <Share2 className="h-4 w-4 opacity-80" />
            Share
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:shadow dark:bg-white/10 dark:text-gray-100"
            title="Automation"
          >
            <Sparkles className="h-4 w-4 opacity-80" />
            Automation
          </button>
        </div>
      </div>
    </div>
  );
}
