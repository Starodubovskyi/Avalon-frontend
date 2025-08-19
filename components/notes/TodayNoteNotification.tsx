"use client";
import { useState, useEffect } from "react";
import { useNotesStore } from "./useNotesStore";

function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function TodayNoteNotification() {
  const notesStore = useNotesStore();
  const todayStr = getTodayStr();

  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissedKey = `todayNoteDismissed:${todayStr}`;
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(dismissedKey) === "true") {
        setShow(false);
        return;
      }
    }
    const todayNotes = notesStore.getNotesByDate(todayStr);
    if (todayNotes.length > 0) {
      setShow(true);
      const timeout = setTimeout(() => {
        setShow(false);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(dismissedKey, "true");
        }
      }, 5000);
      return () => clearTimeout(timeout);
    } else {
      setShow(false);
    }
  }, [todayStr, notesStore.notes.length]);

  const closeNotif = () => {
    setShow(false);
    const dismissedKey = `todayNoteDismissed:${todayStr}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(dismissedKey, "true");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-xl bg-blue-500/90 text-white font-medium text-base animate-bounceInDown">
        <span>🔔 You have a note for today!</span>
        <button
          onClick={closeNotif}
          className="ml-1 p-1 rounded-full hover:bg-white/20 transition"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
      <style>{`
        @keyframes bounceInDown {
          0% { opacity: 0; transform: translateY(-40px) scale(.95);}
          50% { opacity: 1; transform: translateY(10px) scale(1.05);}
          100% { opacity: 1; transform: translateY(0) scale(1);}
        }
        .animate-bounceInDown { animation: bounceInDown 0.55s cubic-bezier(.58,2.2,.44,1) both; }
      `}</style>
    </div>
  );
}
