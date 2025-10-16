"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  className?: string;
  side?: "center" | "right";
};

export default function Modal({
  children,
  onClose,
  wide,
  className,
  side = "center",
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 10);
    return () => clearTimeout(t);
  }, []);

  const maxW = wide ? "max-w-4xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {side === "center" ? (
        <div
          className={`relative m-4 mx-auto flex h-[calc(100%-2rem)] w-full items-center justify-center ${maxW} ${
            className ?? ""
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      ) : (
        <div
          className={`relative ml-auto flex h-full w-full transform transition-transform duration-200 ease-out ${
            className ?? ""
          } ${open ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      )}
    </div>
  );
}
