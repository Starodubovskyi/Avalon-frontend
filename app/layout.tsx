import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTimeZone, getTranslations } from "next-intl/server";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/lib/auth/useAuth";
import { Toaster } from "sonner";
import { LocaleSync } from "@/components/providers/LocaleSync";

const sans = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});
// Headings: Manrope covers Cyrillic (RU) and Romanian diacritics (ș, ț) — Plus Jakarta Sans had no Cyrillic
const display = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const ICONS: Metadata["icons"] = {
  icon: [
    { url: "/brand/avalon-icon-32.png", sizes: "32x32", type: "image/png" },
    {
      url: "/brand/avalon-icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
  ],
  apple: [
    {
      url: "/brand/avalon-icon-180.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
};

/** Tab title, description and home-screen name in the interface language (cookie locale) */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.meta");
  return {
    title: t("title"),
    description: t("description"),
    icons: ICONS,
    appleWebApp: {
      capable: true,
      title: t("appleTitle"),
      statusBarStyle: "default",
    },
  };
}

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, messages, timeZone, t] = await Promise.all([
    getLocale(),
    getMessages(),
    getTimeZone(),
    getTranslations("common"),
  ]);
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`h-svh overflow-hidden ${sans.variable} ${display.variable}`}
    >
      <body className="flex h-svh min-h-0 flex-col overflow-hidden font-sans">
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone={timeZone}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthProvider>
              <LocaleSync />
              {children}
            </AuthProvider>
            <Toaster
              richColors
              closeButton
              position="top-right"
              containerAriaLabel={t("notifications")}
              toastOptions={{ closeButtonAriaLabel: t("closeNotification") }}
            />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
