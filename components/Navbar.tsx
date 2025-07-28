"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import logo from "../img/logo-1.png";

import HomeButton from "./nav/HomeButton";
import HowItWorksButton from "./nav/HowItWorksButton";
import ForOwnersButton from "./nav/ForOwnersButton";
import ForInspectorsButton from "./nav/ForInspectorsButton";
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);

    const loggedInStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsLoggedIn(loggedInStatus);

    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

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
    router.push("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/60 dark:bg-black/40 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6 py-4">
        {/* Лого */}
        <Link href="/">
          <Image src={logo} alt="Dashboard Logo" width={40} />
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex gap-5">
          <HomeButton />
          <HowItWorksButton />
          <ForOwnersButton />
          <ForInspectorsButton />
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-1 border border-foreground rounded-full hover:bg-muted transition"
              >
                Log in
              </Link>
              <Link
                href="/dashboard"
                className="text-sm px-4 py-1 bg-primary text-white rounded-full hover:bg-primary/90 transition"
              >
                Get Started
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
                      {currentUser?.name
                        ? currentUser.name.substring(0, 2).toUpperCase()
                        : "US"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    My Account
                    {currentUser && (
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
  );
};

export default Navbar;
