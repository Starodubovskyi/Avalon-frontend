"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

import SettingsTopNav, {
  SettingsTabKey,
  TABS,
} from "@/components/settings/SettingsTopNav";

import AccountSecurity from "@/components/settings/AccountSecurity";
import Notifications from "@/components/settings/Notifications";
import Appearance from "@/components/settings/Appearance";
import Privacy from "@/components/settings/Privacy";
import Integrations from "@/components/settings/Integrations";
import DangerZone from "@/components/settings/DangerZone";

function isValidTab(key: string | null | undefined): key is SettingsTabKey {
  return !!key && TABS.some((t) => t.key === key);
}

function getHashTab(): SettingsTabKey {
  const raw = (
    typeof window !== "undefined" ? window.location.hash.replace("#", "") : ""
  ) as SettingsTabKey;
  return isValidTab(raw) ? raw : "account-security";
}

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTabKey>("account-security");

  useEffect(() => {
    const init = getHashTab();
    setActive(init);

    const onHash = () => setActive(getHashTab());
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

  const handleChangeTab = (key: SettingsTabKey) => {
    if (!isValidTab(key)) return;
    if (typeof window !== "undefined") {
      if (window.location.hash.replace("#", "") !== key) {
        window.location.hash = key;
      }
    }
    setActive(key);
  };

  return (
    <MainLayout>
      <div className="min-h-[100dvh] w-full bg-gray-100 dark:bg-black">
        <div className="w-full px-4 sm:px-6 py-6">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Settings
          </h1>

          <div className="mb-6">
            <SettingsTopNav active={active} onChange={handleChangeTab} />
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
