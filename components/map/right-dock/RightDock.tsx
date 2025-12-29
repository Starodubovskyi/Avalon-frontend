"use client";

import { useEffect, useState } from "react";
import type { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";

/* --- TYPES --- */
interface ExtendedAdapter extends LeafletAdapter {
  flyTo?: (lat: number, lng: number, zoom?: number) => void;
  getMap?: () => any;
}

type MenuView = "main" | "layers" | "basemap";

export default function RightDock({
  adapter,
  rightOffsetPx = 0,
}: {
  adapter: ExtendedAdapter;
  rightOffsetPx?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<MenuView>("main");
  const [isLocating, setIsLocating] = useState(false);
  const [vesselCount, setVesselCount] = useState(0);

  // Сброс меню в начало при закрытии
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setView("main"), 200); // задержка для анимации
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Следим за судами
  useEffect(() => {
    const update = () => {
      try {
        setVesselCount(adapter.getVisibleCount?.() || 0);
      } catch {
        setVesselCount(0);
      }
    };
    update();
    return adapter.onMove?.(update);
  }, [adapter]);

  /* --- ACTIONS --- */
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (adapter.flyTo) adapter.flyTo(latitude, longitude, 13);
        else adapter.getMap?.().flyTo([latitude, longitude], 13);
        setIsOpen(false);
      },
      () => setIsLocating(false)
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
    setIsOpen(false);
  };

  /* --- RENDER --- */
  return (
    <>
      {/* ГЛАВНАЯ КНОПКА (TRIGGER) 
        Позиция: Правый верхний угол
      */}
      <div
        className="fixed z-[1000] flex flex-col items-end gap-4"
        style={{
          top: `calc(env(safe-area-inset-top) + 16px)`,
          right: `calc(${rightOffsetPx}px + env(safe-area-inset-right) + 16px)`,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl
            transition-all duration-300 ease-in-out
            ${
              isOpen
                ? "bg-zinc-900 text-white rotate-90 dark:bg-white dark:text-black"
                : "bg-white text-zinc-900 dark:bg-black dark:text-white hover:scale-105"
            }
          `}
          aria-label="Menu"
        >
          {isOpen ? <Icons.Close /> : <Icons.Plus />}

          {/* Бейдж с кол-вом судов (виден только когда меню закрыто) */}
          {!isOpen && vesselCount > 0 && (
            <span
              className="
              absolute -top-1 -left-1 flex h-5 min-w-[20px] items-center justify-center rounded-full 
              bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm
            "
            >
              {formatCount(vesselCount)}
            </span>
          )}
        </button>

        {/* ВЫПАДАЮЩЕЕ МЕНЮ 
          Появляется под кнопкой
        */}
        <div
          className={`
            origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            w-64 overflow-hidden rounded-2xl shadow-2xl border
            bg-white/95 backdrop-blur-md dark:bg-zinc-950/95
            border-zinc-100 dark:border-zinc-800
            ${
              isOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-90 -translate-y-4 pointer-events-none h-0"
            }
          `}
        >
          <div className="p-2">
            {/* VIEW: MAIN (Главное меню) */}
            {view === "main" && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-left-4 fade-in duration-200">
                <MenuItem
                  label="Map Style"
                  icon={<Icons.Map />}
                  onClick={() => setView("basemap")}
                  chevron
                />
                <MenuItem
                  label="Data Layers"
                  icon={<Icons.Layers />}
                  onClick={() => setView("layers")}
                  chevron
                />
                <div className="my-1 h-[1px] bg-zinc-100 dark:bg-zinc-800" />
                <MenuItem
                  label="Find Me"
                  icon={<Icons.Locate loading={isLocating} />}
                  onClick={handleLocate}
                />
                <MenuItem
                  label="Fullscreen"
                  icon={<Icons.Maximize />}
                  onClick={toggleFullscreen}
                />
              </div>
            )}

            {/* VIEW: BASEMAP (Выбор карты) */}
            {view === "basemap" && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 fade-in duration-200">
                <MenuHeader title="Map Style" onBack={() => setView("main")} />
                <BasemapList adapter={adapter} />
              </div>
            )}

            {/* VIEW: LAYERS (Слои) */}
            {view === "layers" && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 fade-in duration-200">
                <MenuHeader title="Layers" onBack={() => setView("main")} />
                <LayersList adapter={adapter} />
              </div>
            )}
          </div>

          {/* Футер статистики */}
          <div className="bg-zinc-50 px-4 py-3 text-center dark:bg-zinc-900/50">
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
              Ships in view
            </div>
            <div className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
              {formatCount(vesselCount)}
            </div>
          </div>
        </div>
      </div>

      {/* Затемнение фона при открытом меню (опционально, для фокуса) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[990] bg-transparent" // Прозрачный, чтобы просто ловить клик
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

/* ============ INTERNAL COMPONENTS ============ */

function MenuItem({
  label,
  icon,
  onClick,
  chevron,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="
        group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left
        transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800
      "
    >
      <span className="text-zinc-500 group-hover:text-black dark:text-zinc-400 dark:group-hover:text-white transition-colors">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
        {label}
      </span>
      {chevron && (
        <span className="text-zinc-300 dark:text-zinc-600">
          <Icons.ChevronRight />
        </span>
      )}
    </button>
  );
}

function MenuHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="mb-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-zinc-500 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <Icons.ChevronLeft />
      <span className="text-xs font-bold uppercase tracking-wider">
        {title}
      </span>
    </button>
  );
}

function BasemapList({ adapter }: { adapter: any }) {
  const [active, setActive] = useState("light");
  const list = [
    { id: "light", label: "Standard" },
    { id: "dark", label: "Dark Mode" },
    { id: "sat", label: "Satellite" },
  ];

  const select = (id: string) => {
    setActive(id);
    adapter.setBasemap?.(id);
  };

  return (
    <>
      {list.map((item) => (
        <button
          key={item.id}
          onClick={() => select(item.id)}
          className={`
            flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors
            ${
              active === item.id
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }
          `}
        >
          {item.label}
          {active === item.id && <Icons.Check />}
        </button>
      ))}
    </>
  );
}

function LayersList({ adapter }: { adapter: any }) {
  // Компонент переключателя
  const ToggleItem = ({ id, label }: { id: string; label: string }) => {
    const [enabled, setEnabled] = useState(true);
    const toggle = () => {
      setEnabled(!enabled);
      adapter.toggleLayer?.(id, !enabled);
    };

    return (
      <div
        onClick={toggle}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {label}
        </span>
        <div
          className={`
          relative h-5 w-9 rounded-full transition-colors duration-200
          ${enabled ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}
        `}
        >
          <div
            className={`
            absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
            ${enabled ? "translate-x-4" : "translate-x-0"}
          `}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <ToggleItem id="ports" label="Major Ports" />
      <ToggleItem id="anch" label="Anchorages" />
      <ToggleItem id="routes" label="Shipping Lanes" />
    </>
  );
}

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

/* ============ ICONS ============ */
const Icons = {
  Plus: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Close: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Map: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  ),
  Layers: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  ),
  Locate: ({ loading }: { loading?: boolean }) =>
    loading ? (
      <svg
        className="animate-spin"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ) : (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
  Maximize: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  Check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
};
