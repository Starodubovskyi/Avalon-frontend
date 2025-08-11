'use client';
import { useState, useEffect } from "react";
import { useNotesStore, Note } from "./useNotesStore";
import StickyNote from "./StickyNote";
import NoteModal from "./NoteModal";

const monthNames = [
  "January","February","March","April","May","June","July","August","September","October","November","December"
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function pad(n: number) { return n < 10 ? `0${n}` : n; }

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const notesStore = useNotesStore();

  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${pad(todayObj.getMonth() + 1)}-${pad(todayObj.getDate())}`;

  const days = daysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sunday

  const calendar: (string | null)[] = [];
  const startDayIdx = (firstDay === 0 ? 6 : firstDay - 1);
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
    <div className="w-full h-full max-w-6xl max-h-full flex flex-col">
      {showNotif && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-xl bg-blue-500/90 text-white font-medium text-base animate-bounceInDown">
            <span>🔔 You have a note for today!</span>
            <button
              onClick={() => setShowNotif(false)}
              className="ml-1 p-1 rounded-full hover:bg-white/20 transition"
              aria-label="Close notification"
            >✕</button>
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
      )}
      <div className="flex items-center justify-between mb-2 sm:mb-4 px-2 sm:px-6">
        <button
          onClick={() => {
            if (month === 0) {
              setYear(y => y - 1);
              setMonth(11);
            } else setMonth(m => m - 1);
          }}
          className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          &#8592;
        </button>
        <div className="font-bold text-lg sm:text-2xl">{monthNames[month]} {year}</div>
        <button
          onClick={() => {
            if (month === 11) {
              setYear(y => y + 1);
              setMonth(0);
            } else setMonth(m => m + 1);
          }}
          className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          &#8594;
        </button>
      </div>
      <div className="flex-1 w-full h-full">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full h-full bg-blue-50 dark:bg-blue-900/30 rounded-lg p-1 sm:p-3">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
            <div
              key={day}
              className="text-center font-semibold text-[11px] sm:text-base text-blue-800 dark:text-blue-100 pb-1"
            >
              {day}
            </div>
          ))}
          {calendar.map((date, idx) => {
            if (!date) return <div key={idx} className="h-12 sm:h-20 md:h-24" />;
            const notes = notesStore.getNotesByDate(date);
            const isToday = date === todayStr;

            return (
              <div
                key={date}
                className={`relative h-12 sm:h-20 md:h-24 flex items-center justify-center
                  ${isToday ? "ring-2 ring-blue-400 dark:ring-blue-300 ring-offset-2 ring-offset-blue-100 dark:ring-offset-blue-950 z-10" : ""}
                `}
              >
                <span
                  className={`text-xs absolute top-1 left-1 z-20 pointer-events-none
                    ${isToday ? "font-bold text-blue-700 dark:text-blue-100" : "text-gray-400"}
                  `}
                >
                  {+date.split('-')[2]}
                </span>
                {notes.length > 0 ? (
                  <StickyNote
                    className={
                      [
                        "bg-yellow-200 dark:bg-yellow-800",
                        "bg-green-200 dark:bg-green-800",
                        "bg-blue-200 dark:bg-blue-800"
                      ][date.charCodeAt(date.length - 1) % 3]
                    }
                    onRemoveComplete={() => notesStore.deleteNote(notes[0].id)}
                  >
                    {notes[0].text}
                  </StickyNote>
                ) : (
                  <button
                    className={`w-full h-full rounded bg-cyan-50 hover:bg-cyan-100 dark:bg-blue-950/40 transition flex items-end justify-end p-1 group ${isToday ? "font-bold text-blue-900 dark:text-blue-200" : ""}`}
                    onClick={() => setModalDate(date)}
                    title="Add note"
                  >
                    <span className="text-gray-200 text-xs opacity-0 group-hover:opacity-100 absolute bottom-1 right-1">＋</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {modalDate &&
        <NoteModal date={modalDate} onClose={() => setModalDate(null)} />
      }
      {editNote &&
        <NoteModal date={editNote.date} note={editNote} onClose={() => setEditNote(null)} />
      }
    </div>
  );
}
