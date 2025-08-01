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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

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
      window.removeEventListener("scroll", handleScroll);
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
      description: "Вы успешно вышли из аккаунта.",
    });
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = (id: string) => {
    scrollTo(id);
    setIsMobileMenuOpen(false);
  };

  const handleGetStartedClick = () => {
    if (isLoggedIn) {
      router.push("/maps");
    } else {
      setIsLoginModalOpen(true);
    }
    setIsMobileMenuOpen(false);
  };

  const navLinkButtonClass =
    "px-6 py-2 rounded-full font-semibold bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 dark:bg-gray-700 dark:text-white dark:hover:bg-teal-600 dark:hover:text-white";

  const getStartedClass =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden text-white bg-black rounded-full px-4 py-3 font-semibold shadow-md transition-all duration-300 hover:bg-black dark:bg-teal-600 dark:hover:bg-teal-700";

  return (
    <div
      className={`sticky top-0 w-full z-50 transition-all duration-300 rounded-b-lg ${
        isScrolled ? "bg-white dark:bg-gray-900 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between py-4">
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer"
        >
          <Logo />
        </div>

        <nav className="hidden md:inline-flex gap-4 px-3 py-2 rounded-full bg-white/60 backdrop-blur-md shadow-md dark:bg-gray-800/60 dark:shadow-lg">
          <button className={navLinkButtonClass} onClick={() => handleNavLinkClick("home")}>
            Home
          </button>
          <button className={navLinkButtonClass} onClick={() => handleNavLinkClick("how-it-works")}>
            How It Works
          </button>
          <button className={navLinkButtonClass} onClick={() => handleNavLinkClick("for-ship-owners")}>
            For Ship Owners
          </button>
          <button className={navLinkButtonClass} onClick={() => handleNavLinkClick("for-inspectors")}>
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
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggler className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300" />

            {!isLoggedIn && (
              <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                <DialogTrigger asChild>
                  <button
                    // Styling for "Log In" button in light theme: transparent with a black border,
                    // becomes black with white text on hover.
                    className="px-6 py-2 rounded-full font-semibold bg-transparent text-black border border-black transition-colors duration-300 hover:bg-black hover:text-white dark:bg-transparent dark:text-white dark:border-teal-600 dark:hover:bg-teal-700 dark:hover:border-teal-700"
                  >
                    Log In
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-[1350px] w-full h-[900px] sm:h-[1050px] md:h-[1050px] lg:h-[900px] flex items-center justify-center overflow-hidden rounded-lg">
                  <AuthModalContent onCloseModal={() => setIsLoginModalOpen(false)} />
                </DialogContent>
              </Dialog>
            )}

            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar>
                    {/* The profile image is now taken from currentUser?.profileImage.
                        If profileImage is not available or the image fails to load,
                        the AvatarFallback will be shown. */}
                    <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name || "User"} />
                    <AvatarFallback className="text-black dark:text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-full h-full p-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.795 0-5.419-.305-7.85-2.07a.75.75 0 01-.438-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <DropdownMenuLabel className="dark:text-white">
                    My Account
                    {currentUser?.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem asChild className="dark:hover:bg-gray-700 dark:text-white">
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="dark:hover:bg-gray-700 dark:text-white">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button onClick={handleGetStartedClick} className={getStartedClass}>
              <span className="relative block overflow-hidden h-6">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                  Get Started
                </span>
                <span className="absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                  Right Now
                </span>
              </span>
              <span className="flex items-center justify-center w-6 h-6 bg-white text-black rounded-full transition-transform duration-300 group-hover:rotate-45 dark:bg-gray-200 dark:text-teal-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 16.5L16.5 7.5M16.5 7.5H10.5M16.5 7.5V13.5" />
                </svg>
              </span>
            </button>
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
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-4 text-lg font-semibold mb-8">
          <button className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => handleNavLinkClick("home")}>Home</button>
          <button className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => handleNavLinkClick("how-it-works")}>How It Works</button>
          <button className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => handleNavLinkClick("for-ship-owners")}>For Ship Owners</button>
          <button className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => handleNavLinkClick("for-inspectors")}>For Inspectors</button>
          <Link href="/companies">
            <button className="text-black dark:text-white text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Companies</button>
          </Link>
        </nav>

        <div className="flex flex-col gap-4 mt-auto">
          <ThemeToggler />
          <button
            onClick={handleGetStartedClick}
            className="w-full py-2.5 px-4 font-semibold rounded-full bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors dark:bg-teal-600 dark:hover:bg-teal-700"
          >
            Get Started
          </button>

          {!isLoggedIn && (
            <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 font-semibold rounded-full bg-transparent text-black border border-black hover:bg-black hover:text-white transition-colors dark:bg-transparent dark:text-white dark:border-teal-600 dark:hover:bg-teal-700 dark:hover:border-teal-700"
                >
                  Log In
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 max-w-[1350px] w-full h-[900px] sm:h-[1050px] md:h-[1050px] lg:h-[900px] flex items-center justify-center overflow-hidden rounded-lg">
                <AuthModalContent onCloseModal={() => setIsLoginModalOpen(false)} />
              </DialogContent>
            </Dialog>
          )}

          {isLoggedIn && (
            <>
              <div className="flex items-center gap-2 mt-4">
                <Avatar>
                  {/* The profile image is now taken from currentUser?.profileImage.
                      If profileImage is not available or the image fails to load,
                      the AvatarFallback will be shown. */}
                  <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name || "User"} />
                  <AvatarFallback className="text-black dark:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full p-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.795 0-5.419-.305-7.85-2.07a.75.75 0 01-.438-.695z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-black dark:text-white">
                  {currentUser?.name || "User"}
                </span>
              </div>
              <button
                className="w-full py-2.5 px-4 font-semibold rounded-full bg-white text-black border border-black hover:bg-gray-100 transition-colors dark:bg-red-700 dark:hover:bg-red-800 dark:border-none dark:text-white"
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
