"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  LifeBuoy,
  Settings,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import ThemeToggler from "@/components/ThemeToggler";
import LogoSideBar from "@/components/ui/LogoSideBar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AuthModalContent from "@/components/auth/AuthModalContent";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import clsx from "clsx";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    lastName?: string;
    avatar?: string | null;
  } | null>(null);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setCurrentUser({
        name: parsedUser.name,
        lastName: parsedUser.lastName,
        avatar: parsedUser.profileImage || null,
      });
    } else {
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("authchange"));
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <div
      className="
          bg-white/10
          border border-gray-200 
          shadow 
          dark:bg-black/20
          dark:border-white/10 
          dark:shadow-white/10
          backdrop-blur-md
          sticky top-0 z-50 w-full h-16
          flex items-center justify-between flex-wrap gap-2
          px-4
        "
    >
      <div className="flex items-center gap-4">
        <LogoSideBar isSidebarExpanded />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <ThemeToggler />

        <Link
          href="/notifications"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
        </Link>

        <Link
          href="/support"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          <LifeBuoy className="w-5 h-5" />
        </Link>

        <Link
          href="/settings"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {!currentUser ? (
          <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
            <DialogTrigger asChild>
              <button
                className={clsx(
                  "rounded-full p-2 transition-all duration-300",
                  theme === "dark"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-black text-white hover:bg-gray-900"
                )}
              >
                <UserCircle className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-[1200px] h-[800px] flex overflow-hidden rounded-lg">
              <AuthModalContent
                onCloseModal={() => setIsAuthModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <DropdownMenu onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 focus:outline-none">
                <div className="flex flex-col items-end text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  <span>
                    {currentUser.name} {currentUser.lastName}
                  </span>
                </div>

                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                )}

                <ChevronDown
                  className={clsx(
                    "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300",
                    isMenuOpen && "rotate-180"
                  )}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44 mt-2 animate-in fade-in slide-in-from-top-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/20 rounded-md shadow-lg dark:shadow-white/10"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1"
                >
                  <UserCircle className="w-4 h-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 hover:text-white hover:bg-red-600 flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Navbar;
