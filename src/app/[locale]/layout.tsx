import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: "/favicon.png" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "BetaBanner" });

  return (
    <html
      lang={locale}
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider>
            {/* Fixed h-8 (not content-sized padding) so its height is a known
                quantity - every full-viewport layout below (dashboard rail,
                loading screens) subtracts this exact value from 100dvh,
                since this bar sits above them in normal flow and would
                otherwise push their h-dvh/min-h-dvh past the real viewport
                and force an unwanted page-level scrollbar. */}
            <div className="flex h-8 shrink-0 items-center justify-center bg-brand px-4 text-center text-xs font-medium text-brand-foreground">
              {t("message")}
            </div>
            {children}
            <Toaster position="top-center" />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
