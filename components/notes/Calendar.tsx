"use client";
import { useState, useEffect } from "react";
import { useNotesStore, Note } from "./useNotesStore";
import StickyNote from "./StickyNote";
import NoteModal from "./NoteModal";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function pad(n: number) {
  return n < 10 ? `0${n}` : n;
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const notesStore = useNotesStore();

  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${pad(
    todayObj.getMonth() + 1
  )}-${pad(todayObj.getDate())}`;

  const days = daysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();

  const calendar: (string | null)[] = [];
  const startDayIdx = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startDayIdx; i++) calendar.push(null);
  for (let d = 1; d <= days; d++) {
    calendar.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  }
  while (calendar.length % 7 !== 0) calendar.push(null);

  const [showNotif, setShowNotif] = useState(false);
  useEffect(() => {
    const todayNotes = notesStore.getNotesByDate(todayStr);
    if (todayNotes.length > 0) {
      setShowNotif(true);
      const timeout = setTimeout(() => setShowNotif(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [todayStr, notesStore.notes.length]);

  return (
    <div className="w-full h-full">
      <div
        className="
        rounded-3xl border border-gray-200 bg-white/70 shadow
        dark:bg-neutral-900/60 dark:border-white/10
        w-full h-full flex flex-col
        p-3 sm:p-5 lg:p-6
      "
      >
        {showNotif && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-xl bg-gray-700/90 text-white font-medium text-base animate-bounceInDown">
              <span>🔔 You have a note for today!</span>
              <button
                onClick={() => setShowNotif(false)}
                className="ml-1 p-1 rounded-full hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={() => {
              if (month === 0) {
                setYear((y) => y - 1);
                setMonth(11);
              } else setMonth((m) => m - 1);
            }}
            className="px-3 h-9 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700
                       dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition"
          >
            &#8592;
          </button>

          <div className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </div>

          <button
            onClick={() => {
              if (month === 11) {
                setYear((y) => y + 1);
                setMonth(0);
              } else setMonth((m) => m + 1);
            }}
            className="px-3 h-9 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700
                       dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition"
          >
            &#8594;
          </button>
        </div>

        <div className="flex-1 w-full">
          <div
            className="
              grid grid-cols-7 gap-1 sm:gap-2 w-full h-full
              rounded-2xl p-2 sm:p-3
              bg-gray-50 dark:bg-neutral-800/50
              border border-gray-100 dark:border-gray-700
            "
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-[11px] sm:text-sm md:text-base text-gray-700 dark:text-gray-300 pb-1"
              >
                {day}
              </div>
            ))}

            {calendar.map((date, idx) => {
              if (!date)
                return <div key={`empty-${idx}`} className="aspect-square" />;
              const notes = notesStore.getNotesByDate(date);
              const isToday = date === todayStr;

              return (
                <div
                  key={date}
                  className={[
                    "relative aspect-square flex items-center justify-center rounded-lg",
                    isToday
                      ? "ring-2 ring-gray-400 dark:ring-gray-500 ring-offset-2 ring-offset-gray-100 dark:ring-offset-neutral-900"
                      : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-[10px] sm:text-xs absolute top-1 left-1 z-20 pointer-events-none",
                      isToday
                        ? "font-bold text-gray-700 dark:text-gray-200"
                        : "text-gray-400",
                    ].join(" ")}
                  >
                    {+date.split("-")[2]}
                  </span>

                  {notes.length > 0 ? (
                    <StickyNote
                      className={
                        [
                          "bg-gray-200 dark:bg-gray-700",
                          "bg-gray-300 dark:bg-gray-600",
                          "bg-gray-100 dark:bg-gray-800",
                        ][date.charCodeAt(date.length - 1) % 3]
                      }
                      onRemoveComplete={() =>
                        notesStore.deleteNote(notes[0].id)
                      }
                    >
                      {notes[0].text}
                    </StickyNote>
                  ) : (
                    <button
                      className="w-full h-full rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-900/40 transition flex items-end justify-end p-1 group"
                      onClick={() => setModalDate(date)}
                    >
                      <span className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 absolute bottom-1 right-1">
                        ＋
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modalDate && (
        <NoteModal date={modalDate} onClose={() => setModalDate(null)} />
      )}
      {editNote && (
        <NoteModal
          date={editNote.date}
          note={editNote}
          onClose={() => setEditNote(null)}
        />
      )}
    </div>
  );
}
