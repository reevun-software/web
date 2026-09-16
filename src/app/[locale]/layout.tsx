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
            {/* truncate, not wrap: the message is long enough in Russian
                (and other locales) to wrap to 2-3 lines on a phone-width
                viewport, which would overflow this fixed h-8 box (nothing
                below reserves more than 2rem for it) and spill over the
                header. The truncated text lives on its own span with
                min-w-0 - as a direct flex child, a plain text node keeps
                its default min-width:auto and refuses to shrink below its
                full (nowrap) width, so it overflows past the padding on
                both sides (it's centered) before overflow-hidden clips it
                at the screen edge, with no ellipsis ever rendered. min-w-0
                lets it actually shrink to fit, which is what makes
                text-overflow:ellipsis (bundled in `truncate`) apply at
                all. A no-op on desktop, where the text already fits. */}
            <div className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-center bg-brand px-4 text-center text-xs font-medium text-brand-foreground">
              <span className="min-w-0 truncate">{t("message")}</span>
            </div>
            <div className="flex flex-1 flex-col pt-8">{children}</div>
            <Toaster position="top-center" />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
