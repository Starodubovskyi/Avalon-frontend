"use client";

import { Menu, Users, X } from "lucide-react";

type Props = {
  onOpenLeft: () => void;
  onOpenRight: () => void;
  showClose?: boolean;
  onCloseAll?: () => void;
};

export default function MobileTopBar({
  onOpenLeft,
  onOpenRight,
  showClose,
  onCloseAll,
}: Props) {
  return (
    <div className="lg:hidden sticky top-0 z-[60] bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur border-b border-gray-200 dark:border-white/10">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          aria-label="Open menu"
          onClick={onOpenLeft}
          className="p-2 rounded-xl border border-gray-200 dark:border-white/10"
        >
          <Menu size={20} />
        </button>

        <span className="text-base font-semibold">Social</span>

        <div className="flex items-center gap-2">
          <button
            aria-label="Open people"
            onClick={onOpenRight}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10"
          >
            <Users size={20} />
          </button>
          {showClose ? (
            <button
              aria-label="Close panels"
              onClick={onCloseAll}
              className="p-2 rounded-xl border border-gray-200 dark:border-white/10"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
