import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Ticket,
  Layers,
  LogIn,
  ArrowLeftRight,
  History,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { DISCORD_BOT_INVITE_URL } from "@/lib/discord";
import { Button } from "@/components/ui/button";
import { DiscordSignInButton } from "@/components/discord-signin-button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reveal } from "@/components/landing/reveal";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

const FEATURES = [
  {
    icon: Users,
    title: "Набор без лишней возни",
    body: "Новый участник заполняет анкету, бот сам отсеивает ботов и спам, а профиль с AFK-статусом собирается по ходу дела.",
  },
  {
    icon: ShieldCheck,
    title: "Ранги растут по порядку",
    body: "Следующий ранг открывается только после предыдущего, а после третьего предупреждения роль снимается сама — без вашего участия.",
  },
  {
    icon: Ticket,
    title: "Обращения не теряются",
    body: "У каждого тикета свой номер и вся переписка под рукой, прямо в панели.",
  },
  {
    icon: ArrowLeftRight,
    title: "Перевод одним кликом",
    body: "Команда /move переносит сразу всех нужных участников в другой голосовой канал.",
  },
  {
    icon: History,
    title: "Видно, кто что сделал",
    body: "Выдача ранга, снятие предупреждения, закрытие тикета — каждое действие остаётся в журнале.",
  },
  {
    icon: Layers,
    title: "Одна учётка на все семьи",
    body: "Управляете несколькими серверами? Переключайтесь между ними без повторного входа.",
  },
];

const STEPS = [
  {
    verb: "Добавьте бота",
    body: "Установите Reevun на свой Discord-сервер — понадобятся права администратора.",
  },
  {
    verb: "Войдите",
    body: "Авторизуйтесь через свой Discord-аккаунт, без отдельного пароля.",
  },
  {
    verb: "Управляйте",
    body: "Ранги, предупреждения и обращения участников в одном месте.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Reevun"
              width={24}
              height={24}
              className="rounded-sm"
              priority
            />
            <span className="text-lg font-semibold tracking-tight">
              Reevun
            </span>
          </span>
          {session?.user ? (
            <Link href="/dashboard" aria-label="Личный кабинет">
              <Avatar>
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {session.user.name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <DiscordSignInButton size="sm" className="btn-glass">
              <LogIn className="size-4" />
              Войти через Discord
            </DiscordSignInButton>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: centered, text only */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-20 pb-10 text-center md:pt-28">
          <h1 className="text-3xl font-semibold tracking-tight leading-[1.15] md:text-5xl">
            Управляйте Discord-сообществом
          </h1>
          <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            Reevun ведёт набор, ранги, предупреждения и обращения в вашей
            семье. Один вход через Discord, доступ только к своей общине.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              render={
                <Link
                  href={DISCORD_BOT_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              size="lg"
              className="btn-glass"
            >
              Добавить бота на сервер
              <ArrowRight className="size-4" />
            </Button>
            <Button render={<Link href="#features" />} variant="ghost" size="lg">
              Смотреть возможности
            </Button>
          </div>
        </section>

        <p className="mx-auto max-w-6xl px-6 pt-4 pb-16 text-center text-sm text-muted-foreground">
          Продукт доступен для проектов MajesticRP, GTA 5 RP и Россия Онлайн.
        </p>

        {/* Features: bento, 6 cells */}
        <section id="features" className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="max-w-[30ch] text-3xl font-semibold tracking-tight">
                Всё, чем управляет бот, теперь и в браузере
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.06}>
                  <Card className="flex h-full flex-col gap-3 border-border/60 bg-card/60 p-6 shadow-none ring-1 ring-transparent transition-colors duration-200 hover:bg-card hover:ring-white/20">
                    <f.icon className="size-5 text-foreground" strokeWidth={1.5} />
                    <h3 className="text-lg font-medium">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works: full-width 3 columns */}
        <section id="how-it-works" className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight">
                Три шага до первой смены
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.verb} delay={i * 0.08}>
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-medium">{s.verb}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight">
                Частые вопросы
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <Faq />
            </Reveal>
          </div>
        </section>

        {/* CTA band */}
        <section className="border-t border-border/60 py-20">
          <Reveal>
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between">
              <h2 className="max-w-[24ch] text-2xl font-semibold tracking-tight">
                Готовы подключить свою семью к Reevun?
              </h2>
              <Button
                render={
                  <Link
                    href={DISCORD_BOT_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                size="lg"
                className="btn-glass"
              >
                Добавить бота на сервер
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
