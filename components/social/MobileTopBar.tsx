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
    <div className="lg:hidden sticky top-0 z-[60]">
      <div className="px-2 pt-2">
        <div
          className="
            rounded-2xl border border-gray-200 bg-white
            shadow-[0_16px_40px_rgba(2,6,23,0.08)]
            dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
            backdrop-blur
          "
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              aria-label="Open menu"
              onClick={onOpenLeft}
              className="
                p-2 rounded-xl border border-gray-200 bg-white
                hover:bg-gray-50
                dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10
                shadow-sm
              "
              type="button"
            >
              <Menu size={20} />
            </button>

            <span className="text-base font-semibold">Social</span>

            <div className="flex items-center gap-2">
              <button
                aria-label="Open people"
                onClick={onOpenRight}
                className="
                  p-2 rounded-xl border border-gray-200 bg-white
                  hover:bg-gray-50
                  dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10
                  shadow-sm
                "
                type="button"
              >
                <Users size={20} />
              </button>

              {showClose ? (
                <button
                  aria-label="Close panels"
                  onClick={onCloseAll}
                  className="
                    p-2 rounded-xl border border-gray-200 bg-white
                    hover:bg-gray-50
                    dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10
                    shadow-sm
                  "
                  type="button"
                >
                  <X size={20} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
