"use client";

import { useState, useMemo } from "react";
import { useNotesStore } from "./useNotesStore";
import StickyNote from "./StickyNote";
import DayNotesPanel from "./DayNotesPanel";
import TodayNoteNotification from "./TodayNoteNotification";

const MONTHS = [
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

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const store = useNotesStore();

  const [panelDate, setPanelDate] = useState<string | null>(null);

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate()
  )}`;

  const days = daysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const startIdx = firstDay === 0 ? 6 : firstDay - 1;

  const calendar = useMemo(() => {
    const c: (string | null)[] = [];
    for (let i = 0; i < startIdx; i++) c.push(null);
    for (let d = 1; d <= days; d++) {
      c.push(`${year}-${pad(month + 1)}-${pad(d)}`);
    }
    while (c.length % 7 !== 0) c.push(null);
    return c;
  }, [year, month, days, startIdx]);

  return (
    <div className="space-y-4">
      <TodayNoteNotification />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (month === 0) {
                setYear((y) => y - 1);
                setMonth(11);
              } else setMonth((m) => m - 1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.06]"
          >
            ←
          </button>

          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {MONTHS[month]} {year}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setYear(today.getFullYear());
                setMonth(today.getMonth());
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.06]"
            >
              Today
            </button>
            <button
              onClick={() => {
                if (month === 11) {
                  setYear((y) => y + 1);
                  setMonth(0);
                } else setMonth((m) => m + 1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.06]"
            >
              →
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-2 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="pb-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                {d}
              </div>
            ))}

            {calendar.map((date, idx) => {
              if (!date)
                return <div key={`empty-${idx}`} className="aspect-square" />;
              const notes = store.getNotesByDate(date);
              const isToday = date === todayStr;
              const extra = Math.max(0, notes.length - 2);

              return (
                <div
                  key={date}
                  className={`relative aspect-square overflow-hidden rounded-lg ${
                    isToday
                      ? "ring-2 ring-gray-300 ring-offset-2 ring-offset-white dark:ring-gray-600 dark:ring-offset-transparent"
                      : ""
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute left-1 top-1 z-10 text-[11px] ${
                      isToday
                        ? "font-semibold text-gray-800 dark:text-gray-100"
                        : "text-gray-400"
                    }`}
                  >
                    {+date.split("-")[2]}
                  </span>

                  <div className="flex h-full flex-col gap-1 p-1">
                    {notes.slice(0, 2).map((n) => (
                      <StickyNote
                        key={n.id}
                        className="h-full min-h-[42%]"
                        onRemoveComplete={() => store.deleteNote(n.id)}
                        onOpen={() => setPanelDate(date)}
                      >
                        {n.text}
                      </StickyNote>
                    ))}

                    {notes.length === 0 && (
                      <button
                        onClick={() => setPanelDate(date)}
                        className="group mt-auto flex h-full w-full items-end justify-end rounded-md bg-gray-50 p-1 transition hover:bg-gray-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.06]"
                        title="Add note"
                      >
                        <span className="absolute bottom-1 right-1 text-xs text-gray-400 opacity-0 transition group-hover:opacity-100">
                          ＋
                        </span>
                      </button>
                    )}

                    {extra > 0 && (
                      <button
                        onClick={() => setPanelDate(date)}
                        className="mt-auto rounded-md border border-dashed border-gray-300 px-2 py-1 text-center text-xs text-gray-500 hover:bg-gray-50 dark:border-white/20 dark:text-gray-400 dark:hover:bg-white/10"
                        title="Open all notes"
                      >
                        +{extra} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DayNotesPanel
        date={panelDate}
        open={!!panelDate}
        onClose={() => setPanelDate(null)}
      />
    </div>
  );
}
