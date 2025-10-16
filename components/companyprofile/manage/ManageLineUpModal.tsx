"use client";

import { useState } from "react";
import { LineUpItem } from "../CompaniRegistation/form/types";
import StepLineUp from "../CompaniRegistation/steps/StepLineUp";

type Props = {
  open: boolean;
  onClose: () => void;
  initialLineup: LineUpItem[];
  onSave: (lineup: LineUpItem[]) => void;
};

const EMPTY_LINEUP_DRAFT: LineUpItem = {
  id: "",
  name: "",
  port: "",
  window: "",
  notes: "",
};

export default function ManageLineUpModal({
  open,
  onClose,
  initialLineup,
  onSave,
}: Props) {
  const [lineup, setLineup] = useState<LineUpItem[]>(initialLineup || []);
  const [lineupDraft, setLineupDraft] =
    useState<LineUpItem>(EMPTY_LINEUP_DRAFT);

  const addLineupItem = () => {
    if (!lineupDraft.port && !lineupDraft.name) return;

    const item: LineUpItem = {
      ...lineupDraft,
      id: crypto.randomUUID(),
      window: lineupDraft.window?.trim() || undefined,
      notes: lineupDraft.notes?.trim() || undefined,
    };

    setLineup((p) => [...p, item]);
    setLineupDraft(EMPTY_LINEUP_DRAFT);
  };

  const removeLineUpItem = (id: string) => {
    setLineup((p) => p.filter((i) => i.id !== id));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[900px]">
        <div className="mx-auto rounded-t-2xl md:rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
            <div className="font-semibold">Manage Line-Up</div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700"
            >
              Close
            </button>
          </div>

          <div className="p-4 sm:p-6 max-h-[70vh] overflow-auto">
            <StepLineUp
              lineup={lineup}
              lineupDraft={lineupDraft}
              setLineupDraft={setLineupDraft}
              addLineupItem={addLineupItem}
              removeLineupItem={removeLineUpItem}
            />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(lineup);
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
