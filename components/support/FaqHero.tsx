"use client";

import { useState } from "react";
import { IconWorld } from "@tabler/icons-react";
import SearchBar from "./SearchBar";

export default function FaqHero() {
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("English");

  return (
    <div className="bg-sky-700 dark:bg-sky-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold tracking-tight">Avalon Ship</div>
          <div className="relative">
            <button onClick={() => setLangOpen((v) => !v)} className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm">
              <IconWorld size={18} />
              {lang}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border border-white/20 bg-white/10 backdrop-blur shadow-lg text-white text-sm overflow-hidden">
                {["English", "Українська", "Русский"].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setLangOpen(false);
                    }}
                    className="block w-full px-3 py-2 hover:bg-white/15 text-left"
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
