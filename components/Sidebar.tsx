"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPinned,
  Building2,
  Ship,
  Bell,
  LifeBuoy,
  UserCircle,
  Menu,
  X,
  LayoutDashboard,
  Anchor,
  Settings,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  CheckSquare,
  StickyNote,
  Users,
} from "lucide-react";
import clsx from "clsx";
import ThemeToggler from "@/components/ThemeToggler";
import LogoSideBar from "@/components/ui/LogoSideBar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AuthModalContent from "@/components/auth/AuthModalContent";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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

const footerItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

interface SidebarProps {
  onEditProfileClick: () => void;
  isLoggedIn: boolean;
  currentUser: { name?: string; lastName?: string; avatar?: string };
}

const Sidebar = ({
  onEditProfileClick,
  isLoggedIn,
  currentUser,
}: SidebarProps) => {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isSidebarExpanded) {
      setShowApplications(false);
    }
  }, [isSidebarExpanded]);

  const SidebarLinks = () => (
    <>
      <div className="space-y-1">
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

        {/* Applications Collapsible */}
        <button
          onClick={() => setShowApplications(!showApplications)}
          className={clsx(
            "group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            "text-muted-foreground hover:bg-muted"
          )}
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

        <div
          className={clsx(
            "pl-8 overflow-hidden transition-all duration-300 ease-in-out",
            showApplications
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-1">
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
        </div>
      </div>

      {/* Footer Items */}
      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
          <ThemeToggler className="w-5 h-5 shrink-0" />
          <span
            className={clsx(
              "text-sm truncate transition-opacity duration-300",
              isSidebarExpanded
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
          >
            Theme
          </span>
        </div>

        {!isLoggedIn ? (
          <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
            <DialogTrigger asChild>
              <button
                className={clsx(
                  "flex items-center justify-center rounded-lg transition-all duration-300 text-white",
                  theme === "dark" ? "bg-green-600" : "bg-black",
                  isSidebarExpanded
                    ? "w-full px-3 py-2 gap-3 hover:opacity-90"
                    : "w-10 h-10 hover:rounded-xl"
                )}
              >
                <UserCircle
                  className={clsx(
                    "shrink-0",
                    isSidebarExpanded ? "w-5 h-5" : "w-6 h-6"
                  )}
                />
                {isSidebarExpanded && (
                  <span className="text-sm transition-opacity duration-300">
                    Log in
                  </span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-[1200px] h-[800px] flex overflow-hidden rounded-lg">
              <AuthModalContent
                onCloseModal={() => setIsAuthModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Link
            href="/profile"
            className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
            ) : (
              <UserCircle className="w-5 h-5 shrink-0" />
            )}
            <span
              className={clsx(
                "text-sm truncate transition-opacity duration-300",
                isSidebarExpanded
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              )}
            >
              {currentUser?.name
                ? `${currentUser.name} ${currentUser.lastName ?? ""}`
                : "Profile"}
            </span>
          </Link>
        )}

        <hr className="border-gray-300 dark:border-gray-700 opacity-50" />

        {footerItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setIsMobileOpen(false)}
            className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span
              className={clsx(
                "text-sm transition-opacity duration-300",
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
    </>
  );

  return (
    <>
      <div
        className={clsx(
          "hidden lg:flex sticky top-0 h-screen transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-md flex-col z-40",
          isSidebarExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div
          className={clsx(
            "flex items-center py-4",
            isSidebarExpanded ? "justify-center" : "pl-4"
          )}
        >
          <LogoSideBar isSidebarExpanded={isSidebarExpanded} />
        </div>

        <div className="flex-1 overflow-y-auto px-2 flex flex-col justify-between">
          {SidebarLinks()}
        </div>
      </div>

      {/* Mobile Toggle */}
      <button
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-md lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="ml-auto h-full w-64 bg-white dark:bg-gray-900 shadow-lg relative p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <LogoSideBar isSidebarExpanded={true} />
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col justify-between">
              {SidebarLinks()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
