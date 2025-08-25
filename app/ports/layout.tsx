import MainLayout from "@/components/layout/MainLayout";


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ports", 
};

export default function PortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">{children}</div>
    </MainLayout>
  );
}
