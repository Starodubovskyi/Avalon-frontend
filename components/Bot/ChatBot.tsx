"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageCircle, X, Send, Compass, Pin, LifeBuoy } from "lucide-react";
import clsx from "clsx";
import { matchTopic, topicButtons, type BotTopic } from "./responses";
import { BotAvatar, BotBubble, GRADIENT_BG, TypingIndicator, type BotMessage } from "./BotBubble";

const QUICK: { topic: BotTopic; icon: ReactNode }[] = [
  { topic: "about", icon: <Compass size={14} aria-hidden /> },
  { topic: "offer", icon: <Pin size={14} aria-hidden /> },
  { topic: "support", icon: <LifeBuoy size={14} aria-hidden /> },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Help-centre assistant: canned answers in the interface language, keywords in EN / RU / RO */
export default function ChatBot({ initialOpen = false }: { initialOpen?: boolean }) {
  const t = useTranslations("support.bot");
  const [open, setOpen] = useState<boolean>(initialOpen);
  // Portal target: a transformed ancestor (the shell's entrance animation) would pin `fixed` to itself
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const greeted = messages.length > 0;
  useEffect(() => {
    if (!open || greeted) return;
    const timer = window.setTimeout(() => setMessages([{ id: uid(), role: "bot", content: t("welcome") }]), 350);
    return () => window.clearTimeout(timer);
  }, [open, greeted, t]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener("chatbot:open", onOpen);
    window.addEventListener("chatbot:close", onClose);
    window.addEventListener("chatbot:toggle", onToggle);
    return () => {
      window.removeEventListener("chatbot:open", onOpen);
      window.removeEventListener("chatbot:close", onClose);
      window.removeEventListener("chatbot:toggle", onToggle);
    };
  }, []);

  /** Shows the user's words, then the answer for `topic` (null → the "didn't understand" reply) */
  const ask = useCallback(
    (text: string, topic: BotTopic | null) => {
      if (!text.trim() || loading) return;
      setMessages((prev) => [...prev, { id: uid(), role: "user", content: text }]);
      setInput("");
      setLoading(true);
      window.setTimeout(() => {
        const reply: BotMessage = topic
          ? { id: uid(), role: "bot", content: t(`answers.${topic}`), buttons: topicButtons(topic) }
          : { id: uid(), role: "bot", content: t("fallback"), buttons: ["offer", "support"] };
        setMessages((prev) => [...prev, reply]);
        setLoading(false);
      }, 700);
    },
    [loading, t],
  );

  const askTopic = (topic: BotTopic) => ask(t(`buttons.${topic}`), topic);

  if (!host) return null;
  return createPortal(
    <>
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[9999] md:bottom-6 md:right-6">
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={clsx(
              "p-4 rounded-full text-white shadow-2xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/30",
              GRADIENT_BG,
            )}
            aria-label={t("open")}
          >
            <MessageCircle size={28} aria-hidden />
          </button>
        )}
      </div>

      <div
        role="dialog"
        aria-label={t("name")}
        aria-hidden={!open}
        className={clsx(
          "fixed z-[10000] w-[calc(100%-1.5rem)] max-w-[400px] flex flex-col",
          "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-[2rem] md:bottom-5",
          "sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-24",
          "bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10",
          "shadow-2xl shadow-black/20 transition-all duration-300 origin-bottom-right overflow-hidden",
          open
            ? "h-[min(600px,80vh)] opacity-100 pointer-events-auto translate-y-0 scale-100"
            : "h-0 opacity-0 pointer-events-none translate-y-10 scale-95",
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <BotAvatar size={18} />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("name")}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t("online")}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-[#050505]/50" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <BotBubble key={msg.id} msg={msg} onTopic={askTopic} />
            ))}
            {loading ? <TypingIndicator /> : null}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5">
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {QUICK.map(({ topic, icon }) => (
              <button
                key={topic}
                type="button"
                onClick={() => askTopic(topic)}
                className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap font-medium"
              >
                {icon}
                <span>{t(`buttons.${topic}`)}</span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input, matchTopic(input));
            }}
            className="relative flex items-center gap-2"
          >
            <input
              type="text"
              className="w-full pl-5 pr-12 py-3 rounded-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1e2329] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-base sm:text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t("send")}
              className={clsx(
                "absolute right-1.5 p-2 rounded-full text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none",
                GRADIENT_BG,
              )}
            >
              <Send size={16} className="ml-0.5" aria-hidden />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">{t("poweredBy")}</span>
          </div>
        </div>
      </div>
    </>,
    host,
  );
}
