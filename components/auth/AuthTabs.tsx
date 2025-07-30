// components/auth/AuthTabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
// import styles from "./AuthTabs.module.css"; // Удален импорт CSS

interface AuthTabsProps {
  onCloseModal: () => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ onCloseModal }) => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="flex flex-col items-center justify-start w-full h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        // Используем прямые классы Tailwind
        className="w-full max-w-md flex flex-col items-center"
      >
        <TabsList className="inline-flex mt-4 mb-6 rounded-full bg-gray-100 p-1">
          <TabsTrigger
            value="login"
            className="py-2 px-4 text-sm font-medium text-gray-600 bg-transparent rounded-[15rem] cursor-pointer transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="py-2 px-4 text-sm font-medium text-gray-600 bg-transparent rounded-[15rem] cursor-pointer transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
          >
            Register
          </TabsTrigger>
        </TabsList>
        {/* Удалены h-full из этого div и TabsContent, чтобы позволить форме быть меньше */}
        <div className="w-full pt-4">
          {" "}
          {/* Убрал h-full */}
          <TabsContent value="login">
            {" "}
            {/* Убрал h-full */}
            <LoginForm
              onSwitchTab={() => setActiveTab("register")}
              onCloseModal={onCloseModal}
            />
          </TabsContent>
          <TabsContent value="register">
            {" "}
            {/* Убрал h-full */}
            <RegisterForm
              onSwitchTab={() => setActiveTab("login")}
              onCloseModal={onCloseModal}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AuthTabs;
