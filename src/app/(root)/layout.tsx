import type { Metadata, Viewport } from "next";
import "../design-system.css";

export const metadata: Metadata = {
  title: "Ehteraf Clinic | احتراف",
  description: "A unified workspace for multi-branch physical therapy clinics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f2ea",
};

export default function RootRedirectLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
