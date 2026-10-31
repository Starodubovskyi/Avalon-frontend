import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/lib/auth/useAuth";
import { PointsProvider } from "@/components/context/PointsContext";
import { Toaster } from "sonner";

const sans = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});
const display = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avalon Shipping — Operations",
  description:
    "Vessel operations board for Avalon Shipping SRL: vessels in work, Sulina channel, checklist, documents and audit log.",
  icons: { icon: "/brand/avalon-logo.png" },
  appleWebApp: { capable: true, title: "Avalon Ops", statusBarStyle: "default" },
};

// Edge-to-edge on phones: the bottom tab bar pads itself with the safe-area inset
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-svh overflow-hidden ${sans.variable} ${display.variable}`}>
      <body className="flex h-svh min-h-0 flex-col overflow-hidden font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
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
