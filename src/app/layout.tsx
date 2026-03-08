import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "مدرسة الرفعة النموذجية — المنصة التعليمية",
  description: "منصة تعليمية رقمية متكاملة لمدرسة الرفعة النموذجية متوسط ثانوي بنين",
  manifest: "/manifest.json",
  themeColor: "#c9970c",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "مدرسة الرفعة النموذجية",
    description: "المنصة التعليمية الرقمية المتكاملة",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#c9970c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-arabic" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
