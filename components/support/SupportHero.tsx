"use client";

import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

export default function SupportHero() {
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("English");

  return (
    <div className="px-2 sm:px-4 py-4">
      <div
        className={clsx(
          "relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl p-8 sm:p-16 text-center",
          GRADIENT_BG
        )}
      >
        {/* Decorative Blur */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-10 text-white/90">
            <div className="font-bold tracking-wide text-lg flex items-center gap-2">
              Avalon Ship
            </div>
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                <Globe size={16} />
                {lang}
                <ChevronDown
                  size={14}
                  className={clsx(
                    "transition-transform",
                    langOpen && "rotate-180"
                  )}
                />
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/20 bg-white/20 backdrop-blur-xl shadow-xl text-white text-sm overflow-hidden z-20"
                  onMouseLeave={() => setLangOpen(false)}
                >
                  {["English", "Українська", "Русский"].map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 hover:bg-white/20 text-left transition-colors"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight drop-shadow-sm max-w-3xl">
            Advice and answers from the Avalon Ship team
          </h1>

          <div className="w-full max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
}
