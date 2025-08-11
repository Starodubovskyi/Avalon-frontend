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
              isSidebarExpanded ? "opacity-100" : "opacity-100"
            )}
          >
            {label}
          </span>
        </Link>
      ))}

      <button
        onClick={() => setShowApplications(!showApplications)}
        className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        <LayoutDashboard className="w-5 h-5 shrink-0" />
        <span
          className={clsx(
            "text-sm font-medium truncate transition-opacity duration-300 flex-1 text-left",
            isSidebarExpanded
              ? "opacity-100"
              : "opacity-100 group-hover:opacity-100"
          )}
        >
          Applications
        </span>
        {isSidebarExpanded &&
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
                  isSidebarExpanded
                    ? "opacity-100"
                    : "opacity-100 group-hover:opacity-100"
                )}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        <Settings className="w-5 h-5 shrink-0" />
        <span
          className={clsx(
            "text-sm font-medium truncate transition-opacity duration-300 flex-1 text-left",
            isSidebarExpanded
              ? "opacity-100"
              : "opacity-100 group-hover:opacity-100"
          )}
        >
          Admin Panel
        </span>
        {isSidebarExpanded &&
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
                  isSidebarExpanded
                    ? "opacity-100"
                    : "opacity-100 group-hover:opacity-100"
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
    <div className="bg-gray-100 dark:bg-black">
      <div
        className="
          bg-white 
          border border-gray-200 
          shadow 
          dark:bg-white/5 
          dark:border-white/10 
          dark:shadow-white/10
        "
      >
        <div
          className={clsx(
            "hidden lg:flex sticky top-0 h-screen transition-all duration-300 overflow-hidden bg-transparent border-none shadow-none flex-col z-40",
            isSidebarExpanded ? "w-48" : "w-16"
          )}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          {SidebarLinks()}
        </div>

        <button
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-md lg:hidden hover:bg-blue-700"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile sidebar */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="ml-auto h-full w-64 bg-white dark:bg-black shadow-lg relative flex flex-col">
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300 dark:border-white/10">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                  Menu
                </span>
                <button onClick={() => setIsMobileOpen(false)}>
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{SidebarLinks()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
