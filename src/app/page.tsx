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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BrandCube } from "@/components/landing/brand-cube";
import { Reveal } from "@/components/landing/reveal";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

const FEATURES = [
  {
    icon: Users,
    title: "Набор и профили",
    body: "Формы заявок с проверкой на ботов, личный профиль и статус AFK для каждого участника.",
    tinted: true,
  },
  {
    icon: ShieldCheck,
    title: "Ранги и предупреждения",
    body: "Повышения по цепочке рангов и автоматический выход из ролей после третьего предупреждения.",
    tinted: false,
  },
  {
    icon: Ticket,
    title: "Обращения и апелляции",
    body: "Тикеты с понятными номерами и историей переписки, доступные из панели.",
    tinted: false,
  },
  {
    icon: ArrowLeftRight,
    title: "Массовый перевод",
    body: "Команда /move переносит выбранных участников между голосовыми каналами разом.",
    tinted: true,
  },
  {
    icon: History,
    title: "Журнал действий",
    body: "Кто выдал ранг, снял предупреждение или закрыл тикет — история сохраняется и видна в панели.",
    tinted: false,
  },
  {
    icon: Layers,
    title: "Несколько семей",
    body: "Один вход через Discord, переключение между семьями без второго аккаунта.",
    tinted: false,
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
            <DiscordSignInButton size="sm">
              <LogIn className="size-4" />
              Войти через Discord
            </DiscordSignInButton>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: asymmetric split */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-10 md:grid-cols-2 md:items-center md:pt-20">
          <div className="flex flex-col gap-6">
            <BrandCube />
            <h1 className="text-4xl font-semibold tracking-tighter leading-none md:text-6xl">
              Управляйте Discord-сообществом из одной панели
            </h1>
            <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground">
              Reevun ведёт набор, ранги, предупреждения и обращения в вашей
              семье. Один вход через Discord, доступ только к своей общине.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                render={
                  <Link
                    href={DISCORD_BOT_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                size="lg"
              >
                Добавить бота на сервер
                <ArrowRight className="size-4" />
              </Button>
              <Button render={<Link href="#features" />} variant="ghost" size="lg">
                Смотреть возможности
              </Button>
            </div>
          </div>

          <Card className="border-border/60 bg-card/60 p-5 shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Участники семьи
              </span>
              <Badge variant="secondary" className="font-mono text-xs">
                MajesticRP GTA5RP
              </Badge>
            </div>
            <Separator className="my-4" />
            <ul className="flex flex-col gap-3">
              {[
                { name: "Дмитрий Соколов", rank: "Ранг 2", warnings: 0 },
                { name: "Алина Ковалёва", rank: "Ранг 3", warnings: 1 },
                { name: "Тимур Насыров", rank: "Ранг 1", warnings: 0 },
              ].map((m) => (
                <li key={m.name} className="flex items-center gap-3">
                  <span className="relative">
                    <Avatar className="size-9">
                      <AvatarFallback className="text-xs">
                        {m.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {m.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {m.rank}
                    </span>
                  </div>
                  {m.warnings > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {m.warnings} предупреждение
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <p className="mx-auto max-w-6xl px-6 pb-16 text-sm text-muted-foreground">
          Уже используют команды MajesticRP GTA5RP и Россия Онлайн.
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
                  <Card
                    className={
                      "flex h-full flex-col gap-3 border-border/60 p-6 shadow-none " +
                      (f.tinted ? "bg-brand/[0.06]" : "bg-card/60")
                    }
                  >
                    <f.icon className="size-5 text-brand" strokeWidth={1.5} />
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
