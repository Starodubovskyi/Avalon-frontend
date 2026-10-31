"use client";

import { useLayoutEffect, type RefObject } from "react";

/** Grows a textarea with its content up to maxPx, then scrolls inside */
export function useAutosize(ref: RefObject<HTMLTextAreaElement>, value: string, maxPx = 200) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, maxPx);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxPx ? "auto" : "hidden";
  }, [ref, value, maxPx]);
}
