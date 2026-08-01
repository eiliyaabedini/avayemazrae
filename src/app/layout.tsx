import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "آوای مزرعه — دفترچه ثبت سمپاشی با صدا",
  description: "ثبت سوابق سمپاشی مزرعه با صدای طبیعی و هوش مصنوعی",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-gray-50 antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
