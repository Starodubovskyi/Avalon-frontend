"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2, Image as ImageIcon } from "lucide-react";
import type { CardModel } from "@/components/types/billing/types";
import {
  removeCard,
  updateCard,
  type SavedCard,
  type CardGradient,
} from "@/components/types/billing/cards";
import { motion, AnimatePresence } from "framer-motion";

const GRADIENTS: Record<CardGradient, string> = {
  goldGreen: "from-yellow-600/70 to-emerald-600/70",
  purpleBlue: "from-purple-600/70 to-sky-600/70",
  roseIndigo: "from-rose-600/70 to-indigo-600/70",
};

function bgStyle(style: SavedCard["style"]) {
  if (!style || style.kind === "gradient") {
    const g = style?.gradient ?? "goldGreen";
    return { className: `bg-gradient-to-r ${GRADIENTS[g]}` };
  }
  return {
    className: "",
    style: {
      backgroundImage: `url(${style.dataUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    } as React.CSSProperties,
  };
}

export default function PaymentCard({
  surfaceClass,
  card,
  cardId,
}: {
  surfaceClass: string;
  card: CardModel & { expMonth: number; expYear: number };
  cardId: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // закрывать по клику вне/ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const btn = buttonRef.current;
      if (btn && btn.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // читаем style из storage (лёгкая синхронизация)
  const [style, setStyle] = useState<SavedCard["style"] | undefined>(undefined);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("app:billing:cards");
      if (raw) {
        const items: SavedCard[] = JSON.parse(raw);
        const me = items.find((c) => c.id === cardId);
        setStyle(me?.style);
      }
    } catch {}
  }, [cardId]);

  const bg = bgStyle(style);

  const onPickGradient = (g: CardGradient) => {
    updateCard(cardId, { style: { kind: "gradient", gradient: g } });
    setStyle({ kind: "gradient", gradient: g });
  };

  const onPickImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      updateCard(cardId, { style: { kind: "image", dataUrl } });
      setStyle({ kind: "image", dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const onDelete = () => {
    removeCard(cardId);
    setOpen(false);
  };

  // ---- ПОРТАЛ: вычисляем позицию меню относительно кнопки
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const marginTop = 8; // отступ вниз от кнопки
      setCoords({
        top: rect.bottom + marginTop + window.scrollY,
        left: rect.right - 256 + window.scrollX, // 256px = ширина меню
        width: 256,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [open]);

  return (
    // Внешний контейнер — relative, БЕЗ overflow
    <div ref={rootRef} className={`${surfaceClass} bg-transparent p-0 relative`}>
      {/* Плитка с фоном — тут overflow-hidden */}
      <div
        className={`relative h-48 w-full overflow-hidden rounded-2xl ${bg.className ?? ""}`}
        style={bg.style}
      >
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="relative h-full w-full p-6 text-white flex flex-col justify-between">
          <div className="text-lg font-semibold tracking-wide uppercase">
            {card.brand === "visa" ? "VISA" : card.brand}
          </div>

          <div className="text-2xl tracking-wider">{card.mask}</div>

          <div className="flex items-center justify-between text-xs opacity-90">
            <div>
              <div className="opacity-80">NAME</div>
              <div className="mt-0.5 text-sm">{card.name}</div>
            </div>
            <div className="text-right">
              <div className="opacity-80">VALID THRU</div>
              <div className="mt-0.5 text-sm">
                {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка меню */}
      <button
        ref={buttonRef}
        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 text-gray-900 grid place-content-center backdrop-blur hover:bg-white z-40"
        aria-label="More"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {/* Меню в портале — НИКОГДА не обрезается родителями */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && coords && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: coords.top,
                  left: Math.max(8, coords.left), // не уезжаем за левый край
                  width: coords.width,
                  zIndex: 9999,
                }}
                className="rounded-xl border border-white/20 bg-black/80 text-white shadow-xl backdrop-blur-xl overflow-visible"
              >
                <div className="px-3 py-2 text-xs uppercase tracking-wide text-white/70">
                  Card style
                </div>

                <div className="px-3 pb-2 grid grid-cols-3 gap-2">
                  {(["goldGreen", "purpleBlue", "roseIndigo"] as CardGradient[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => onPickGradient(g)}
                      className={`h-10 rounded-lg bg-gradient-to-r ${GRADIENTS[g]} ring-1 ring-white/10`}
                      title={g}
                    />
                  ))}
                  <label className="h-10 rounded-lg bg-white/10 hover:bg-white/15 grid place-content-center cursor-pointer ring-1 ring-white/10">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onPickImage(f);
                      }}
                    />
                    <ImageIcon className="h-4 w-4" />
                  </label>
                </div>

                <div className="h-px bg-white/10" />

                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-rose-300 hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete card
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
