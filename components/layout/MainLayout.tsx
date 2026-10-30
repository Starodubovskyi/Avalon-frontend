"use client";

import { AppShell } from "@/components/ops/shell/AppShell";

/** Legacy pages share the operations shell (navigation, auth guard, theme) */
const MainLayout = ({
  children,
  fill = false,
}: {
  children: React.ReactNode;
  fill?: boolean;
}) => {
  return <AppShell fill={fill}>{children}</AppShell>;
};

export default MainLayout;
