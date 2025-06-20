import type { Metadata } from "next";
import Navbar from "../../components/layout/NavbarServer";
import Footer from "../../components/layout/Footer";
import { themeInitScript } from "@/lib/theme/theme-init";
import "../../styles/globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from '@/lib/auth/auth.context'
import { AuthRedirectWatcher } from "@/lib/auth/AuthRedirectWatcher";

export const metadata: Metadata = {
  title: "MODULON",
  description: "MODULON - AUTH SYSTEM BASE",
  authors: [{ name: "bos-8", url: "https://github.com/bos-8" }],
};

export default async function LocaleLayout({
  children, params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(["pl", "en"], locale)) {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <NextIntlClientProvider>
          <AuthProvider>
            <Navbar />
            <AuthRedirectWatcher />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
