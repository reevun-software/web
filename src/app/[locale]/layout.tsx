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
            {/* Pinned (fixed, not static-flow) so it stays visible while the
                page scrolls instead of disappearing off the top - h-8 is a
                known quantity (not content-sized padding), and everything
                below still reserves exactly that much space for it (the
                pt-8 wrapper here, and every full-viewport layout downstream
                that subtracts 2rem from 100dvh) since a fixed element no
                longer pushes flow content down on its own. */}
            <div className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-center bg-brand px-4 text-center text-xs font-medium text-brand-foreground">
              {t("message")}
            </div>
            <div className="flex flex-1 flex-col pt-8">{children}</div>
            <Toaster position="top-center" />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
