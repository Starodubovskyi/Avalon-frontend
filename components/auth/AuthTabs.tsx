"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthTabsProps {
  onCloseModal: () => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ onCloseModal }) => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="flex flex-col items-center justify-start w-full h-full bg-white dark:bg-gray-900">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col items-center"
      >
        <TabsList className="inline-flex mt-4 mb-6 rounded-full bg-gray-100 p-1 h-[46px] w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg dark:bg-gray-700">
          <TabsTrigger
            value="login"
            className="flex-1 text-center cursor-pointer relative z-10 py-2 px-4 rounded-full transition-all duration-300 font-semibold text-base
                         data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-teal-600 dark:data-[state=active]:text-white
                         data-[state=inactive]:text-black dark:data-[state=inactive]:text-gray-300"
          >
            Login
          </TabsTrigger>

          <TabsTrigger
            value="register"
            className="flex-1 text-center cursor-pointer relative z-10 py-2 px-4 rounded-full transition-all duration-300 font-semibold text-base
                         data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-teal-600 dark:data-[state=active]:text-white
                         data-[state=inactive]:text-black dark:data-[state=inactive]:text-gray-300"
          >
            Register
          </TabsTrigger>
        </TabsList>

        {/* Изменено: h-full для занятия доступного пространства, overflow-y-auto для прокрутки,
            удален overflow-hidden, который обрезал содержимое. */}
        <div className="w-full h-full pt-4 relative min-h-[500px] sm:min-h-[550px] overflow-y-auto">
          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out
              ${
                activeTab === "login"
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-full pointer-events-none"
              }`}
          >
            <LoginForm
              onSwitchTab={() => setActiveTab("register")}
              onCloseModal={onCloseModal}
            />
          </div>
          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out
              ${
                activeTab === "register"
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-full pointer-events-none"
              }`}
          >
            <RegisterForm
              onSwitchTab={() => setActiveTab("login")}
              onCloseModal={onCloseModal}
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default AuthTabs;
