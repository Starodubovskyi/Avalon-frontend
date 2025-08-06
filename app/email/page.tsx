"use client";

import EmailDashboard from "@/components/email-page/emailDashboard";
import MainLayout from "@/components/layout/MainLayout";
import ThemeToggler from "@/components/ThemeToggler";
import React from "react";

const EmailPage: React.FC = () => {
  return (
    <MainLayout>
      <EmailDashboard
        currentUser={{
          name: "",
          email: "",
        }}
      />
      <ThemeToggler />
    </MainLayout>
  );
};

export default EmailPage;
