"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import BackButton from "@/components/BackButton";
import styles from "./AuthTabs.module.css";

const AuthTabs = () => {
  return (
    <div className={styles.container}>
      <div className={styles.backButtonWrapper}>
        <BackButton
          text="Back to Home"
          link="/"
          className={styles.tabTrigger} // Reusing same style for button
        />
      </div>
      <Tabs defaultValue="login" className={styles.tabWrapper}>
        <TabsList className={styles.tabList}>
          <TabsTrigger value="login" className={styles.tabTrigger}>
            Login
          </TabsTrigger>
          <TabsTrigger value="register" className={styles.tabTrigger}>
            Register
          </TabsTrigger>
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
