"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { responses } from "./responses"; 

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

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickButtons: { label: string; icon: string }[] = [
    { label: "About us", icon: "🧭" },
    { label: "What does we offer", icon: "📌" },
    { label: "Support", icon: "🛟" },
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
              "👋 Hello, I’m Avalon’s virtual assistant!How can I help you make the most of your fleet today?",
          },
        ]);
      }, 350);
    }
  }, [open]);

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
      <div className="fixed bottom-4 right-4 z-[51] sm:right-8 sm:bottom-8">
        {!open && (
          <button
            onClick={toggleChat}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg text-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open chat"
          >
            💬
          </button>
        )}
      </div>

      <div
        className={`
          fixed left-1/2 -translate-x-1/2 bottom-0 z-[100] w-full max-w-[440px]
          sm:right-6 sm:left-auto sm:translate-x-0 sm:bottom-8
          flex flex-col
          border rounded-t-2xl rounded-b-2xl sm:rounded-b-2xl shadow-2xl
          transition-all duration-300
          ${open ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-4"}
          bg-white border-gray-300 dark:bg-neutral-900 dark:border-neutral-700
        `}
        style={{
          height: open ? "min(98svh, 88vh)" : 0,
          minHeight: open ? 320 : 0,
          maxHeight: "98svh",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b font-semibold text-center bg-gray-50 border-gray-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 transition-colors">
          <span className="text-base flex-1 text-center select-none">💬 Chatbot</span>
          <button
            aria-label="Close"
            onClick={toggleChat}
            className="text-gray-400 hover:text-red-500 text-xl transition ml-4"
            tabIndex={open ? 0 : -1}
          >
            <svg viewBox="0 0 20 20" width="24" height="24" fill="none">
              <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 p-2 sm:p-3 overflow-y-auto space-y-4 text-sm bg-gray-50 dark:bg-neutral-900 transition-colors custom-scroll">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                transition={bubbleVariants.transition}
                variants={bubbleVariants}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center text-white font-bold shrink-0 ${
                      msg.role === "user" ? "bg-blue-600" : "bg-green-600"
                    }`}
                    aria-hidden
                  >
                    {msg.role === "user" ? "You" : "🤖"}
                  </div>
                  <div
                    className={`
                      max-w-[84vw] sm:max-w-[70%] p-3 rounded-2xl break-words whitespace-pre-wrap transition-colors
                      ${msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-green-100 text-gray-900 rounded-bl-none dark:bg-green-900/40 dark:text-neutral-100"}
                    `}
                  >
                    <ReactMarkdown
                      components={{
                        a: (props) => (
                          <a
                            {...props}
                            className="underline hover:no-underline text-blue-700 dark:text-blue-400"
                            target="_blank"
                            rel="noreferrer"
                          />
                        ),
                        strong: (props) => <strong {...props} className="font-semibold" />,
                        em: (props) => <em {...props} className="opacity-90" />,
                        br: () => <br />,
                      }}
                      skipHtml={false}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                {msg.role === "bot" && msg.buttons && (
                  <div className="flex gap-2 mt-2 flex-wrap">
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
                        className="bg-white dark:bg-neutral-800 border border-blue-500 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-neutral-700 transition"
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
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                variants={bubbleVariants}
                className="flex items-start gap-2"
              >
                <div className="rounded-full w-8 h-8 flex items-center justify-center text-white font-bold bg-green-600">
                  🤖
                </div>
                <div className="max-w-[84vw] sm:max-w-[70%] p-3 rounded-2xl rounded-bl-none bg-green-100 text-gray-900 dark:bg-green-900/40 dark:text-neutral-100">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 flex-nowrap overflow-x-auto py-2 px-1 justify-center border-t border-b bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700">
          {quickButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => sendMessage(btn.label)}
              className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-blue-500 text-blue-600 dark:text-blue-400 text-xs px-2 sm:px-3 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-neutral-700 transition whitespace-nowrap"
            >
              <span className="text-base">{btn.icon}</span>
              <span className="truncate">{btn.label}</span>
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex border-t p-2 sm:p-3 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 transition-colors"
        >
          <input
            type="text"
            className="flex-1 p-3 min-h-[44px] rounded-xl border text-sm bg-white dark:bg-neutral-800 dark:text-neutral-100 border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something..."
            onKeyDown={handleKeyDown}
            autoComplete="off"
            tabIndex={open ? 0 : -1}
          />
          <button
            type="submit"
            disabled={loading}
            className="ml-2 sm:ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            tabIndex={open ? 0 : -1}
          >
            ➤
          </button>
        </form>
      </div>
    </>
  );
}
