import Image from "next/image";
import Link from "next/link";
import { StatusPill } from "@/components/landing/status-pill";

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
          <StatusPill className="mt-2" />
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
          <span className="text-sm font-medium">Ресурсы</span>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Команды
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Поддержка
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Документация
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Обратная связь
          </Link>
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
          © 2023–{new Date().getFullYear()}. Reevun Software LLC.
        </p>
      </div>
    </footer>
  );
}
