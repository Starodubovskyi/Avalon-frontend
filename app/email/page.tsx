"use client";

import EmailDashboard from "@/components/email-page/emailDashboard";
import MainLayout from "@/components/layout/MainLayout";
import ThemeToggler from "@/components/ThemeToggler";
import React from "react";

const EmailPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="h-[100dvh]">
        <EmailDashboard
          currentUser={{
            name: "",
            email: "",
          }}
        />
      </div>
    </MainLayout>
  );
};

export default EmailPage;
