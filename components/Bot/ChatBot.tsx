"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { responses } from "./responses"; // Убедитесь, что этот файл существует
import {
  MessageCircle,
  X,
  Send,
  Compass,
  Pin,
  LifeBuoy,
  Bot,
} from "lucide-react";
import clsx from "clsx";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  buttons?: string[];
};

const bubbleVariants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.22, ease: easeOut },
};

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TypingIndicator() {
  return (
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
  );
}

export default function ChatBot({
  initialOpen = false,
}: {
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState<boolean>(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickButtons: { label: string; icon: React.ReactNode }[] = [
    { label: "About us", icon: <Compass size={14} /> },
    { label: "What does we offer", icon: <Pin size={14} /> },
    { label: "Support", icon: <LifeBuoy size={14} /> },
  ];

  const toggleChat = () => setOpen((prev) => !prev);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: uid(),
            role: "bot",
            content:
              "👋 Hello, I’m Avalon’s virtual assistant! How can I help you make the most of your fleet today?",
          },
        ]);
      }, 350);
    }
  }, [open]);

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

  const getFakeBotReply = (text: string): Omit<Message, "id"> => {
    const lower = text.toLowerCase();
    const match = responses.find((r) =>
      r.keywords.some((kw) => lower.includes(kw.toLowerCase()))
    );
    return {
      role: "bot",
      content: match?.reply || responses[responses.length - 1].reply,
      buttons: match?.buttons,
    };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage: Message = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const botCore = getFakeBotReply(text);
      const botMessage: Message = { id: uid(), ...botCore };
      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    }, 700);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        {!open && (
          <button
            onClick={toggleChat}
            className={clsx(
              "p-4 rounded-full text-white shadow-2xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/30",
              GRADIENT_BG
            )}
            aria-label="Open chat"
          >
            <MessageCircle size={28} />
          </button>
        )}
      </div>

      <div
        className={clsx(
          "fixed z-[10000] w-full max-w-[400px] flex flex-col",

          // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
          // Мобильные стили (работают везде, если экран маленький):
          "bottom-5 left-1/2 -translate-x-1/2",

          // Десктопные стили (sm: переопределяют мобильные):
          "sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-24 sm:rounded-[2rem]",

          "bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10",
          "shadow-2xl shadow-black/20",
          "transition-all duration-300 origin-bottom-right overflow-hidden",
          open
            ? "opacity-100 pointer-events-auto translate-y-0 scale-100"
            : "opacity-0 pointer-events-none translate-y-10 scale-95"
        )}
        style={{
          // Убрали отсюда всю логику window.innerWidth
          height: open ? "min(600px, 80vh)" : 0,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm",
                GRADIENT_BG
              )}
            >
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Avalon Assistant
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Online
                </span>
              </div>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={toggleChat}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-[#050505]/50 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                variants={bubbleVariants}
                className={clsx(
                  "flex flex-col",
                  msg.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={clsx(
                    "flex gap-2 max-w-[85%]",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm",
                      msg.role === "user"
                        ? "bg-gray-900 dark:bg-white dark:text-black"
                        : GRADIENT_BG
                    )}
                  >
                    {msg.role === "user" ? "U" : <Bot size={16} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={clsx(
                      "p-3.5 rounded-2xl text-sm shadow-sm break-words leading-relaxed",
                      msg.role === "user"
                        ? `${GRADIENT_BG} text-white rounded-tr-none`
                        : "bg-white dark:bg-[#1e2329] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-white/5 rounded-tl-none"
                    )}
                  >
                    <ReactMarkdown
                      components={{
                        a: (props) => (
                          <a
                            {...props}
                            className="underline hover:opacity-80"
                            target="_blank"
                            rel="noreferrer"
                          />
                        ),
                        strong: (props) => (
                          <strong {...props} className="font-bold" />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Bot Buttons */}
                {msg.role === "bot" && msg.buttons && (
                  <div className="flex gap-2 mt-2 ml-10 flex-wrap">
                    {msg.buttons.map((btnText, i) => (
                      <button
                        key={`${msg.id}-btn-${i}`}
                        onClick={() => {
                          if (btnText === "Pricing") {
                            const botMessage: Message = {
                              id: uid(),
                              role: "bot",
                              content: "💡 Pricing information is coming soon!",
                            };
                            setMessages((prev) => [...prev, botMessage]);
                          } else {
                            sendMessage(btnText);
                          }
                        }}
                        className="bg-white dark:bg-[#1e2329] border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/10 transition shadow-sm font-medium"
                      >
                        {btnText}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm",
                    GRADIENT_BG
                  )}
                >
                  <Bot size={16} />
                </div>
                <div className="bg-white dark:bg-[#1e2329] border border-gray-100 dark:border-white/5 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5">
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mask-gradient">
            {quickButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => sendMessage(btn.label)}
                className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap font-medium"
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="relative flex items-center gap-2"
          >
            <input
              type="text"
              className="w-full pl-5 pr-12 py-3 rounded-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1e2329] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={clsx(
                "absolute right-1.5 p-2 rounded-full text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none",
                GRADIENT_BG
              )}
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">
              Powered by Avalon AI
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
