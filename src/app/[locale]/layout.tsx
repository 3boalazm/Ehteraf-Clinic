import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter/standard.css";
import "@fontsource/ibm-plex-sans-arabic/arabic.css";
import { AppShell } from "@/components/layout/app-shell";
import type { Locale } from "@/types";
import "../globals.css";
import "../clinic.css";
import "../reference-theme.css";
import "../module-suite.css";
import "../spatial-dashboard.css";

export const metadata: Metadata = {
  title: {
    default: "Ehteraf Clinic | احتراف",
    template: "%s | Ehteraf Clinic",
  },
  description:
    "A bilingual workspace for multi-branch physical therapy clinic management.",
  applicationName: "Ehteraf Clinic",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8f8" },
    { media: "(prefers-color-scheme: dark)", color: "#111a20" },
  ],
};

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className="font-sans antialiased">
        <AppShell locale={locale as Locale}>{children}</AppShell>
      </body>
    </html>
  );
}
