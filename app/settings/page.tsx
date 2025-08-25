"use client";

import { useEffect, useMemo, useState } from "react";
import SettingsTopNav, { SettingsTabKey, TABS } from "@/components/settings/SettingsTopNav";
import AccountSecurity from "@/components/settings/AccountSecurity";
import Notifications from "@/components/settings/Notifications";
import Appearance from "@/components/settings/Appearance";
import Privacy from "@/components/settings/Privacy";
import Integrations from "@/components/settings/Integrations";
import DangerZone from "@/components/settings/DangerZone";
import MainLayout from "@/components/layout/MainLayout";

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTabKey>("account-security");

  useEffect(() => {
    const initial = (window.location.hash.replace("#", "") as SettingsTabKey) || "account-security";
    if (TABS.some((t) => t.key === initial)) setActive(initial);
    const onHash = () => {
      const h = (window.location.hash.replace("#", "") as SettingsTabKey) || "account-security";
      if (TABS.some((t) => t.key === h)) setActive(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const Content = useMemo(() => {
    switch (active) {
      case "account-security":
        return <AccountSecurity />;
      case "notifications":
        return <Notifications />;
      case "appearance":
        return <Appearance />;
      case "privacy":
        return <Privacy />;
      case "integrations":
        return <Integrations />;
      case "danger":
        return <DangerZone />;
      default:
        return null;
    }
  }, [active]);

  return (
    <MainLayout>

    <div className="min-h-[100dvh] w-full bg-gray-100 dark:bg-black">
      <div className="w-full px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          Settings
        </h1>

        <div className="mb-6">
          <SettingsTopNav
            active={active}
            onChange={(key) => {
                window.location.hash = key;
                setActive(key);
            }}
            />
        </div>

        <div
          className="
          w-full rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8
          shadow-[0_16px_40px_rgba(2,6,23,0.08)]
          dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
          "
          >
          {Content}
        </div>
      </div>
    </div>
            </MainLayout>
  );
}
