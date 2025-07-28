// components/AuthTabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm"; // Убедитесь, что путь к LoginForm правильный
import RegisterForm from "./RegisterForm"; // Убедитесь, что путь к RegisterForm правильный
import BackButton from "@/components/BackButton"; // Путь должен быть правильным

const AuthTabs = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute top-4 left-4 z-10">
        {/* Передаем обязательные свойства text и link */}
        <BackButton text="Back to Home" link="/" />{" "}
        {/* Или link="/dashboard", в зависимости от вашей логики */}
      </div>

      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthTabs;
