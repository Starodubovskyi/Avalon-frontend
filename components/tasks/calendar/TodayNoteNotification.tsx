"use client";
import { useState, useEffect } from "react";
import { useNotesStore } from "./useNotesStore";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function TodayNoteNotification() {
  const store = useNotesStore();
  const key = `todayNoteDismissed:${todayStr()}`;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(key) === "true")
      return;
    setShow(store.getNotesByDate(todayStr()).length > 0);
  }, [store.notes.length]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[60] -translate-x-1/2">
      <div className="animate-[notif_.5s_both] rounded-2xl bg-gray-900/90 px-4 py-2 text-white shadow-xl dark:bg-white/10">
        🔔 You have a note for today!
        <button
          onClick={() => {
            setShow(false);
            if (typeof window !== "undefined")
              sessionStorage.setItem(key, "true");
          }}
          className="ml-2 rounded px-2 py-0.5 hover:bg-white/10"
        >
          Close
        </button>
      </div>
      <style>{`
        @keyframes notif { from { opacity: 0; transform: translateY(-10px)} to { opacity: 1; transform: translateY(0)} }
      `}</style>
    </div>
  );
}
