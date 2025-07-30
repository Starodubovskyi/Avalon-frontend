"use client";

import AuthTabs from "@/components/auth/AuthTabs";
import ThemeToggler from "@/components/ThemeToggler";

const AuthPage = () => {
  const onCloseModal = () => {
    console.log("Modal close requested from AuthPage (placeholder)");
  };

  return (
    <>
      <AuthTabs onCloseModal={onCloseModal} />
      <div className="absolute bottom-5 right-0 text-white">
        <ThemeToggler />
      </div>
    </>
  );
};

export default AuthPage;
