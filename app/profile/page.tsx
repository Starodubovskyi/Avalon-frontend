// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout"; // Импортируем ваш MainLayout
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button"; // <--- Импорт для компонента Button

interface User {
  name: string;
  email: string;
  // Добавьте другие поля пользователя, если они есть, но не пароль
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      toast({
        title: "Access Denied",
        description: "Please log in to view your profile.",
        variant: "destructive",
      });
      router.push("/login"); // Перенаправляем на страницу входа, если не авторизован
      return; // Важно, чтобы не продолжать выполнять код ниже
    }

    // Если авторизован, загружаем данные пользователя
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        // Очищаем некорректные данные и перенаправляем
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("currentUser");
        router.push("/login");
        toast({
          title: "Error",
          description: "Failed to load user data. Please log in again.",
          variant: "destructive",
        });
      }
    } else {
      // Если isAuthenticated true, но currentUser отсутствует
      localStorage.removeItem("isAuthenticated");
      router.push("/login");
      toast({
        title: "Error",
        description: "User session expired. Please log in again.",
        variant: "destructive",
      });
    }
  }, [router]);

  // Если пользователь не авторизован или данные еще не загружены, можно ничего не рендерить
  if (!user) {
    return (
      <MainLayout>
        {" "}
        {/* Это позволит отобразить Navbar и Sidebar пока идет редирект или загрузка */}
        <div className="flex justify-center items-center h-full">
          <p>Loading profile...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {" "}
      {/* Оборачиваем в MainLayout, если эта страница должна иметь Sidebar */}
      <div className="flex flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
            <CardDescription>Details of your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback className="text-3xl">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>

            {/* Дополнительная информация о профиле может быть добавлена здесь */}
            <div className="pt-4 border-t border-border mt-4 text-center">
              <Button
                onClick={() =>
                  toast({
                    title: "Feature coming soon!",
                    description: "Profile editing is not yet implemented.",
                  })
                }
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
