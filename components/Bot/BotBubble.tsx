"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { motion, easeOut } from "framer-motion";
import { useTranslations } from "next-intl";
import { Bot } from "lucide-react";
import clsx from "clsx";
import type { BotTopic } from "./responses";

export type BotMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  buttons?: BotTopic[];
};

export const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

const bubbleVariants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.22, ease: easeOut },
};

export function BotAvatar({ size = 16 }: { size?: number }) {
  return (
    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0", GRADIENT_BG)}>
      <Bot size={size} aria-hidden />
    </div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div key="typing" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
      <BotAvatar />
      <div className="bg-white dark:bg-[#1e2329] border border-gray-100 dark:border-white/5 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
              initial={{ opacity: 0.3, y: 0 }}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function BotBubble({ msg, onTopic }: { msg: BotMessage; onTopic: (topic: BotTopic) => void }) {
  const t = useTranslations("support.bot");
  const mine = msg.role === "user";
  return (
    <motion.div layout initial="initial" animate="animate" exit="exit" variants={bubbleVariants} className={clsx("flex flex-col", mine ? "items-end" : "items-start")}>
      <div className={clsx("flex gap-2 max-w-[85%]", mine ? "flex-row-reverse" : "flex-row")}>
        {mine ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm bg-gray-900 text-white dark:bg-white dark:text-black" aria-hidden>
            {t("userInitial")}
          </div>
        ) : (
          <BotAvatar />
        )}
        <div
          className={clsx(
            "p-3.5 rounded-2xl text-sm shadow-sm break-words leading-relaxed",
            mine
              ? `${GRADIENT_BG} text-white rounded-tr-none`
              : "bg-white dark:bg-[#1e2329] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-white/5 rounded-tl-none",
          )}
        >
          <span className="sr-only">{mine ? t("you") : t("name")}: </span>
          <ReactMarkdown
            components={{
              a: ({ href = "", children }) =>
                href.startsWith("/") ? (
                  <Link href={href} className="underline hover:opacity-80">
                    {children}
                  </Link>
                ) : (
                  <a href={href} className="underline hover:opacity-80" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>

      {!mine && msg.buttons?.length ? (
        <div className="flex gap-2 mt-2 ml-10 flex-wrap">
          {msg.buttons.map((topic) => (
            <button
              key={`${msg.id}-${topic}`}
              type="button"
              onClick={() => onTopic(topic)}
              className="bg-white dark:bg-[#1e2329] border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/10 transition shadow-sm font-medium"
            >
              {t(`buttons.${topic}`)}
            </button>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
