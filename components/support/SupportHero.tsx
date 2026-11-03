"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Globe, ChevronDown, Check } from "lucide-react";
import clsx from "clsx";
import { LOCALES, LOCALE_LABEL } from "@/i18n/config";
import { useAppLocale } from "@/lib/i18n/useAppLocale";
import SearchBar from "./SearchBar";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

export default function SupportHero() {
  const t = useTranslations("support.hero");
  const { locale, setLocale, pending } = useAppLocale();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="px-2 sm:px-4 py-4">
      <div
        className={clsx(
          "relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl px-5 py-8 sm:p-16 text-center",
          GRADIENT_BG
        )}
      >
        {/* Decorative blur (the old /noise.png overlay pointed at a file that never shipped — a 404 on every visit) */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-full flex items-center justify-between gap-3 mb-10 text-white/90">
            <div className="font-bold tracking-wide text-lg flex items-center gap-2">
              {t("brand")}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={t("language")}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-70"
                disabled={pending}
              >
                <Globe size={16} aria-hidden />
                {LOCALE_LABEL[locale].name}
                <ChevronDown
                  size={14}
                  aria-hidden
                  className={clsx(
                    "transition-transform",
                    langOpen && "rotate-180"
                  )}
                />
              </button>
              {langOpen && (
                <div
                  role="listbox"
                  aria-label={t("language")}
                  className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/20 bg-white/20 backdrop-blur-xl shadow-xl text-white text-sm overflow-hidden z-20"
                  onMouseLeave={() => setLangOpen(false)}
                >
                  {LOCALES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      role="option"
                      aria-selected={l === locale}
                      onClick={() => {
                        setLangOpen(false);
                        if (l !== locale) setLocale(l);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 hover:bg-white/20 text-left transition-colors"
                    >
                      {LOCALE_LABEL[l].name}
                      {l === locale ? <Check size={14} aria-hidden /> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight drop-shadow-sm max-w-3xl [overflow-wrap:anywhere]">
            {t("title")}
          </h1>

          <div className="w-full max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
}
