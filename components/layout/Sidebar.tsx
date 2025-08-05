"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import clsx from "clsx"
import { useEffect, useState } from "react"

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Maps", href: "/maps", icon: MapPinned },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ports", href: "/ports", icon: Anchor },
  { label: "Vessels", href: "/vessels", icon: Ship },
  { label: "Companies", href: "/companies", icon: Building2 },
]

const applicationItems = [
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Email", href: "/email", icon: Mail },
  { label: "To Do", href: "/todo", icon: CheckSquare },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Social Feed", href: "/social", icon: Users },
]

const adminItems = [
  { label: "Dashboard", href: "/admindashboard" },
  { label: "Companies", href: "/admincompanies" },
]

const Sidebar = () => {
  const pathname = usePathname()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [showApplications, setShowApplications] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (!isSidebarExpanded) {
      setShowApplications(false)
      setShowAdminPanel(false)
    } else {
      if (
        pathname.startsWith("/admindashboard") ||
        pathname.startsWith("/admin/companies")
      ) {
        setShowAdminPanel(true)
      } else {
        setShowAdminPanel(false)
      }
    }
  }, [isSidebarExpanded, pathname])

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
              ? "bg-muted text-primary font-medium"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span
            className={clsx(
              "text-sm font-medium truncate transition-opacity duration-300",
              isSidebarExpanded
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
          >
            {label}
          </span>
        </Link>
      ))}

      <button
        onClick={() => setShowApplications(!showApplications)}
        className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
      >
        <LayoutDashboard className="w-5 h-5 shrink-0" />
        <span
          className={clsx(
            "text-sm font-medium truncate transition-opacity duration-300 flex-1 text-left",
            isSidebarExpanded
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
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
                  ? "bg-muted text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span
                className={clsx(
                  "text-sm truncate transition-opacity duration-300",
                  isSidebarExpanded
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
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
        className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
      >
        <Settings className="w-5 h-5 shrink-0" />
        <span
          className={clsx(
            "text-sm font-medium truncate transition-opacity duration-300 flex-1 text-left",
            isSidebarExpanded
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
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
                  ? "bg-muted text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span
                className={clsx(
                  "text-sm truncate transition-opacity duration-300",
                  isSidebarExpanded
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={clsx(
          "hidden lg:flex sticky top-0 h-screen transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-md flex-col z-40",
          isSidebarExpanded ? "w-48" : "w-16"
        )}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {SidebarLinks()}
      </div>

      {/* Mobile toggle button */}
      <button
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-md lg:hidden"
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
          <div className="ml-auto h-full w-64 bg-white dark:bg-gray-900 shadow-lg relative flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <span className="text-lg font-semibold">Menu</span>
              <button onClick={() => setIsMobileOpen(false)}>
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{SidebarLinks()}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
