"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "./nav/Logo";
import ThemeToggler from "./ThemeToggler";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AuthModalContent from "./auth/AuthModalContent";

const scrollTo = (id: string) => {
  if (typeof window !== "undefined") {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);

    const loggedInStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsLoggedIn(loggedInStatus);

    const userData = localStorage.getItem("currentUser");
    if (userData) setCurrentUser(JSON.parse(userData));

    const handleStorageChange = () => {
      const newLoggedInStatus =
        localStorage.getItem("isAuthenticated") === "true";
      setIsLoggedIn(newLoggedInStatus);
      const newUserData = localStorage.getItem("currentUser");
      setCurrentUser(newUserData ? JSON.parse(newUserData) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = (id: string) => {
    scrollTo(id);
    setIsMobileMenuOpen(false);
  };

  const navButton =
    "px-6 py-2 rounded-full font-semibold bg-white text-black hover:bg-black hover:text-white transition-colors duration-300";

  const getStartedClass =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden text-white bg-black rounded-full px-6 py-3 font-semibold shadow-md transition-all duration-300 hover:bg-black";

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-black shadow-md" // Изменено: bg-white (полностью белый), dark:bg-black (полностью черный), добавлена тень
          : "bg-transparent"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6 py-4">
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer"
        >
          <Logo />
        </div>

        <nav className="hidden md:inline-flex gap-4 px-3 py-2 rounded-full bg-white/60 backdrop-blur-md shadow-md">
          <button
            className={navButton}
            onClick={() => handleNavLinkClick("home")}
          >
            Home
          </button>
          <button
            className={navButton}
            onClick={() => handleNavLinkClick("how-it-works")}
          >
            How It Works
          </button>
          <button
            className={navButton}
            onClick={() => handleNavLinkClick("for-ship-owners")}
          >
            For Ship Owners
          </button>
          <button
            className={navButton}
            onClick={() => handleNavLinkClick("for-inspectors")}
          >
            For Inspectors
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6 text-black dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Dialog
                  open={isAuthModalOpen}
                  onOpenChange={setIsAuthModalOpen}
                >
                  <DialogTrigger asChild>
                    <button className={navButton}>Log in</button>
                  </DialogTrigger>
                  <DialogContent className="p-0 max-w-[1200px] h-[800px] flex overflow-hidden rounded-lg">
                    <AuthModalContent
                      onCloseModal={() => setIsAuthModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Link href="/dashboard" className={getStartedClass}>
                  <span className="relative block overflow-hidden h-6">
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                      Get Started
                    </span>
                    <span className="absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                      Right Now
                    </span>
                  </span>
                  <span className="flex items-center justify-center w-6 h-6 bg-white text-black rounded-full transition-transform duration-300 group-hover:rotate-45">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 16.5L16.5 7.5M16.5 7.5H10.5M16.5 7.5V13.5"
                      />
                    </svg>
                  </span>
                </Link>
              </>
            ) : (
              <>
                <ThemeToggler />
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar>
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback className="text-black dark:text-white">
                        {currentUser?.name?.substring(0, 2).toUpperCase() ||
                          "US"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      My Account
                      {currentUser?.email && (
                        <div className="text-xs text-gray-500">
                          {currentUser.email}
                        </div>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-75 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } p-6 flex flex-col`}
      >
        <div className="flex justify-end mb-8">
          <button
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu"
          >
            <svg
              className="w-6 h-6 text-black dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-4 text-lg font-semibold mb-8">
          <button
            className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => handleNavLinkClick("home")}
          >
            Home
          </button>
          <button
            className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => handleNavLinkClick("how-it-works")}
          >
            How It Works
          </button>
          <button
            className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => handleNavLinkClick("for-ship-owners")}
          >
            For Ship Owners
          </button>
          <button
            className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => handleNavLinkClick("for-inspectors")}
          >
            For Inspectors
          </button>
        </nav>

        <div className="flex flex-col gap-4 mt-auto">
          {!isLoggedIn ? (
            <>
              <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                <DialogTrigger asChild>
                  <button className="w-full py-2.5 px-4 font-semibold rounded-full bg-black text-white transition-all duration-250 ease-in-out cursor-pointer hover:bg-gray-800">
                    Log in
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-[1200px] h-[800px] flex overflow-hidden rounded-lg">
                  <AuthModalContent
                    onCloseModal={() => setIsAuthModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Link
                href="/dashboard"
                className="w-full py-2.5 px-4 font-semibold rounded-full bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <ThemeToggler />
              <div className="flex items-center gap-2 mt-4">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback className="text-black dark:text-white">
                    {currentUser?.name?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-black dark:text-white">
                  {currentUser?.name || "User"}
                </span>
              </div>
              <button
                className="w-full py-2.5 px-4 font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
