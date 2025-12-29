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
  goldGreen: "from-yellow-600/80 to-emerald-600/80",
  purpleBlue: "from-purple-600/80 to-sky-600/80",
  roseIndigo: "from-rose-600/80 to-indigo-600/80",
};

function bgStyle(style: SavedCard["style"]) {
  if (!style || style.kind === "gradient") {
    const g = style?.gradient ?? "goldGreen";
    return { className: `bg-gradient-to-br ${GRADIENTS[g]}` };
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

  // Logic unchanged
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

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const marginTop = 8;
      setCoords({
        top: rect.bottom + marginTop + window.scrollY,
        left: rect.right - 220 + window.scrollX,
        width: 220,
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
    <div
      ref={rootRef}
      className={`${surfaceClass} bg-transparent p-0 relative group`}
    >
      <div
        className={`relative h-56 w-full overflow-hidden rounded-[2rem] shadow-lg transition-transform group-hover:scale-[1.02] duration-500 ${
          bg.className ?? ""
        }`}
        style={bg.style}
      >
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        <div className="relative h-full w-full p-8 text-white flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-xl font-bold tracking-widest uppercase opacity-90 font-mono">
              {card.brand === "visa" ? "VISA" : card.brand}
            </div>
            <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-md" />
          </div>

          <div className="text-2xl font-mono tracking-widest drop-shadow-sm">
            •••• •••• •••• {card.mask}
          </div>

          <div className="flex items-center justify-between text-xs font-medium opacity-90 tracking-wide">
            <div>
              <div className="opacity-60 text-[10px] mb-1">CARD HOLDER</div>
              <div className="uppercase">{card.name || "YOUR NAME"}</div>
            </div>
            <div className="text-right">
              <div className="opacity-60 text-[10px] mb-1">EXPIRES</div>
              <div>
                {String(card.expMonth).padStart(2, "0")}/
                {String(card.expYear).slice(-2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        ref={buttonRef}
        className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 text-white grid place-content-center backdrop-blur-md hover:bg-white/20 transition-colors z-40 border border-white/10"
        aria-label="More"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && coords && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  zIndex: 9999,
                }}
                className="rounded-3xl border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-[#161b22]/90 text-gray-900 dark:text-white shadow-2xl backdrop-blur-xl overflow-hidden p-2"
              >
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Customization
                </div>

                <div className="px-2 pb-2 grid grid-cols-3 gap-2">
                  {(
                    ["goldGreen", "purpleBlue", "roseIndigo"] as CardGradient[]
                  ).map((g) => (
                    <button
                      key={g}
                      onClick={() => onPickGradient(g)}
                      className={`h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[g]} ring-1 ring-black/5 dark:ring-white/10 hover:scale-105 transition-transform`}
                      title={g}
                    />
                  ))}
                  <label className="h-10 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 grid place-content-center cursor-pointer transition-colors text-gray-500 dark:text-gray-400">
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

                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Card
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
