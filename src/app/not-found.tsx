import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

// Genuinely unmatched routes (no file matches the URL at all, e.g. a typo)
// always hit this root boundary in the App Router, never the nested
// /[locale]/not-found.tsx - that one only fires for our own explicit
// notFound() calls inside a resolved locale segment (e.g. an unknown
// guildId). Real 404s land here regardless of locale, so this must be a
// self-sufficient page, not a redirect - the middleware's locale detection
// still lets getTranslations() resolve the visitor's language correctly.
export default async function GlobalNotFound() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("NotFound"),
  ]);

  return (
    <html
      lang={locale}
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="rounded-sm opacity-60"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("body")}</p>
          <Button render={<Link href="/" />} variant="ghost">
            <ArrowLeft className="size-4" />
            {t("home")}
          </Button>
        </div>
      </body>
    </html>
  );
}
