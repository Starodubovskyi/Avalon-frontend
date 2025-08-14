"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPinned,
  Building2,
  Ship,
  LayoutDashboard,
  Anchor,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  CheckSquare,
  StickyNote,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Maps", href: "/maps", icon: MapPinned },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ports", href: "/ports", icon: Anchor },
  { label: "Vessels", href: "/vessels", icon: Ship },
  { label: "Companies", href: "/companies", icon: Building2 },
];

const applicationItems = [
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Email", href: "/email", icon: Mail },
  { label: "To Do", href: "/todo", icon: CheckSquare },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Social Feed", href: "/social", icon: Users },
];

const adminItems = [
  { label: "Dashboard", href: "/admindashboard" },
  { label: "Companies", href: "/admincompanies" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Автооткрытие админ-панели при наведении на десктопе
  useEffect(() => {
    if (!isSidebarExpanded) {
      setShowApplications(false);
      setShowAdminPanel(false);
    } else {
      if (
        pathname.startsWith("/admindashboard") ||
        pathname.startsWith("/admin/companies")
      ) {
        setShowAdminPanel(true);
      } else {
        setShowAdminPanel(false);
      }
    }
  }, [isSidebarExpanded, pathname]);

  // ESC закрывает мобильное меню
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setIsMobileOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  // Блокируем скролл страницы при открытом мобильном меню
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMobileOpen);
    // при открытии мобильного — всегда показываем подписи
    if (isMobileOpen) setIsSidebarExpanded(true);
  }, [isMobileOpen]);

  // Флаг «расширенности» для показа подписей: на мобилке всегда true
  const isExpandedForLabels = isSidebarExpanded || isMobileOpen;

  const SidebarLinks = () => (
    <div className="space-y-1 px-2 py-4">
      {navItems.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setIsMobileOpen(false)}
          className={clsx(
            "group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname === href
              ? "bg-gray-200 text-blue-700 font-medium dark:bg-gray-700 dark:text-blue-400"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
          )}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span
            className={clsx(
              "text-sm font-medium truncate transition-opacity duration-300",
              isExpandedForLabels ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            {label}
          </span>
        </Link>
      ))}

      <button
        onClick={() => setShowApplications((v) => !v)}
        className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        <LayoutDashboard className="w-5 h-5 shrink-0" />
        <span
          className={clsx(
            "text-sm font-medium truncate transition-opacity duration-300 flex-1 text-left",
            isExpandedForLabels ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          Applications
        </span>
        {isExpandedForLabels &&
          (showApplications ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          ))}
      </button>

      {showApplications && (
        <div className="pl-8 space-y-1">
          {applicationItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                pathname === href
                  ? "bg-gray-200 text-blue-700 font-medium dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-300"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span
                className={clsx(
                  "text-sm truncate transition-opacity duration-300",
                  isExpandedForLabels ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAdminPanel((v) => !v)}
        className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        <Settings className="w-5 h-5 shrink-0" />
        <span
          className={clsx(
            "text-sm font-medium truncate transition-opacity duration-300 flex-1 text-left",
            isExpandedForLabels ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          Admin Panel
        </span>
        {isExpandedForLabels &&
          (showAdminPanel ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          ))}
      </button>

      {showAdminPanel && (
        <div className="pl-8 space-y-1">
          {adminItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                pathname.startsWith(href)
                  ? "bg-gray-200 text-blue-700 font-medium dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-300"
              )}
            >
              <span
                className={clsx(
                  "text-sm truncate transition-opacity duration-300",
                  isExpandedForLabels ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* FAB-кнопка — удобно большим пальцем */}
      <button
        type="button"
        aria-label="Open sidebar"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/80 dark:bg-black/40 dark:border-white/10 backdrop-blur-md shadow-lg active:scale-95"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Затемняющая подложка */}
      <div
        className={clsx(
          "lg:hidden fixed inset-0 z-40 transition-opacity",
          isMobileOpen ? "opacity-100 pointer-events-auto bg-black/50" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Мобильный сайдбар */}
      <aside
        className={clsx(
          "lg:hidden fixed z-50 top-0 left-0 h-full w-72 transform transition-transform duration-300 ease-out",
          "bg-white/80 border-r border-gray-200 shadow-lg dark:bg-black/40 dark:border-white/10 backdrop-blur-xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/70 dark:border-white/10">
          <span className="text-sm font-semibold">Menu</span>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsMobileOpen(false)}
            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          {SidebarLinks()}
        </div>
      </aside>

      {/* Десктопный сайдбар */}
      <div
        className={clsx(
          "hidden lg:flex sticky top-0 h-screen transition-all duration-300 overflow-hidden",
          "bg-white/10 border border-gray-200 shadow dark:bg-black/20 dark:border-white/10 dark:shadow-white/10 backdrop-blur-md",
          isSidebarExpanded ? "w-48" : "w-16"
        )}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {SidebarLinks()}
      </div>
    </>
  );
};

export default Sidebar;
