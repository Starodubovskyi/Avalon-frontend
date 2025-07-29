// components/auth/AuthTabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import styles from "./AuthTabs.module.css";

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
        className={styles.tabWrapper}
      >
        <TabsList className={styles.tabList}>
          <TabsTrigger value="login" className={styles.tabTrigger}>
            Login
          </TabsTrigger>
          <TabsTrigger value="register" className={styles.tabTrigger}>
            Register
          </TabsTrigger>
        </TabsList>
        {/* Удаляем flex-1 и overflow-y-auto. tabs-content-area - это просто контейнер, не должен вызывать скролл */}
        <div className="w-full pt-4 h-full">
          {" "}
          {/* Добавляем h-full сюда */}
          <TabsContent value="login" className="h-full">
            <LoginForm
              onSwitchTab={() => setActiveTab("register")}
              onCloseModal={onCloseModal}
            />
          </TabsContent>
          <TabsContent value="register" className="h-full">
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
