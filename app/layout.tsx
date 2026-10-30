import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/lib/auth/useAuth";
import { PointsProvider } from "@/components/context/PointsContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin", "latin-ext", "cyrillic"] });

export const metadata: Metadata = {
  title: "Avalon Shipping — Operations",
  description:
    "Vessel operations board for Avalon Shipping SRL: vessels in work, Sulina channel, checklist, documents and audit log.",
  icons: { icon: "/brand/avalon-logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-svh overflow-hidden">
      <body
        className={`${inter.className} h-svh overflow-hidden flex flex-col min-h-0`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PointsProvider>{children}</PointsProvider>
          </AuthProvider>
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
