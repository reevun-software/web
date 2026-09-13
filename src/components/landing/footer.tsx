import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StatusPill } from "@/components/landing/status-pill";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Reevun"
              width={22}
              height={22}
              className="rounded-sm"
            />
            <span className="text-base font-semibold tracking-tight">
              Reevun
            </span>
          </span>
          <p className="max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
            {t("description")}
          </p>
          <StatusPill className="mt-2" />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">{t("product")}</span>
          <Link
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("features")}
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("howItWorks")}
          </Link>
          <Link
            href="#faq"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("questions")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">{t("resources")}</span>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("commands")}
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("support")}
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("documentation")}
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("feedback")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">{t("legal")}</span>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("terms")}
          </Link>
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © 2023–{new Date().getFullYear()}. {t("copyright")}
          </p>
          <p>{t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
