import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ports",
};

/** Pass-through: the page renders its own AppShell, so no second shell here */
export default function PortsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
