// components/Navbar.tsx
"use client"; // Добавляем 'use client' так как используем хуки React

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react"; // Импортируем хуки
import { useRouter } from "next/navigation"; // Для программной навигации после выхода

import logo from "../img/logo-1.png"; // Убедитесь, что путь к логотипу правильный
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
import { toast } from "@/components/ui/use-toast"; // Для уведомлений при выходе

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // Для хранения данных текущего пользователя
  const router = useRouter();

  useEffect(() => {
    // Проверяем статус аутентификации при загрузке компонента
    const loggedInStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsLoggedIn(loggedInStatus);

    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Слушаем изменения в localStorage, если нужно реагировать на изменения из других вкладок/источников
    const handleStorageChange = () => {
      const newLoggedInStatus =
        localStorage.getItem("isAuthenticated") === "true";
      setIsLoggedIn(newLoggedInStatus);
      const newUserData = localStorage.getItem("currentUser");
      setCurrentUser(newUserData ? JSON.parse(newUserData) : null);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser"); // Удаляем данные пользователя
    setIsLoggedIn(false);
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login"); // Перенаправляем на страницу входа
  };

  return (
    <div className="bg-background text-foreground py-4 px-6 flex items-center justify-between border-b border-border shadow-sm">
      {/* Лого */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Image src={logo} alt="Dashboard" width={40} />
        </Link>
      </div>

      {/* Навигация по центру */}
      <nav className="hidden md:flex gap-5">
        <HomeButton />
        <HowItWorksButton />
        <ForOwnersButton />
        <ForInspectorsButton />
      </nav>

      {/* Правая часть */}
      <div className="flex items-center gap-4">
        {/* Условное отображение: кнопки Log In/Get Started ИЛИ меню пользователя */}
        {!isLoggedIn ? (
          <>
            {/* Log in */}
            <Link
              href="/login"
              className="text-sm px-4 py-1 border border-foreground rounded-full hover:bg-muted transition"
            >
              Log in
            </Link>

            {/* Get Started */}
            <Link
              href="/dashboard"
              className="text-sm px-4 py-1 bg-primary text-white rounded-full hover:bg-primary/90 transition"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>
            {/* Theme toggler (доступен как для гостей, так и для вошедших) */}
            <ThemeToggler />

            {/* Dropdown user menu */}
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
  );
};

export default Navbar;
