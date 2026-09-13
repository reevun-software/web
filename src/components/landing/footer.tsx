import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { DiscordSignInButton } from "@/components/discord-signin-button";
import { DISCORD_BOT_INVITE_URL } from "@/lib/discord";

export function Footer() {
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
            Панель управления Discord-ботом для RP-сообществ: набор, ранги,
            предупреждения и обращения в одном месте.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Продукт</span>
          <Link
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Возможности
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Как это работает
          </Link>
          <Link
            href="#faq"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Вопросы
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Начать</span>
          <Link
            href={DISCORD_BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Добавить бота на сервер
          </Link>
          <DiscordSignInButton
            variant="link"
            className="h-auto justify-start p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
          >
            <LogIn className="size-3.5" />
            Войти через Discord
          </DiscordSignInButton>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Правовая информация</span>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Политика конфиденциальности
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Условия использования
          </Link>
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-6">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} Reevun.
        </p>
      </div>
    </footer>
  );
}
