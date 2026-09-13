import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Ticket,
  Layers,
  LogIn,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscordSignInButton } from "@/components/discord-signin-button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    icon: Layers,
    title: "Несколько семей",
    body: "Один вход через Discord, переключение между семьями без второго аккаунта.",
    tinted: true,
  },
];

const STEPS = [
  {
    verb: "Войдите",
    body: "Авторизуйтесь через свой Discord-аккаунт, без отдельного пароля.",
  },
  {
    verb: "Выберите семью",
    body: "Панель покажет только те серверы, где у вас есть права управления.",
  },
  {
    verb: "Управляйте",
    body: "Ранги, предупреждения и обращения участников в одном месте.",
  },
];

export default function Home() {
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
          <DiscordSignInButton size="sm">
            <LogIn className="size-4" />
            Войти через Discord
          </DiscordSignInButton>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: asymmetric split */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-10 md:grid-cols-2 md:items-center md:pt-20">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-semibold tracking-tighter leading-none md:text-6xl">
              Управляйте Discord-сообществом из одной панели
            </h1>
            <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground">
              Reevun ведёт набор, ранги, предупреждения и обращения в вашей
              семье. Один вход через Discord, доступ только к своей общине.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <DiscordSignInButton size="lg">
                Войти через Discord
                <ArrowRight className="size-4" />
              </DiscordSignInButton>
              <Button render={<Link href="#features" />} variant="ghost" size="lg">
                Смотреть возможности
              </Button>
            </div>
          </div>

          <Card className="border-border/60 bg-card/60 p-5 shadow-none animate-in fade-in slide-in-from-bottom-4 duration-700">
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

        {/* Features: asymmetric bento */}
        <section id="features" className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="max-w-[30ch] text-3xl font-semibold tracking-tight">
              Всё, чем управляет бот, теперь и в браузере
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {FEATURES.map((f) => (
                <Card
                  key={f.title}
                  className={
                    "flex flex-col gap-3 border-border/60 p-6 shadow-none " +
                    (f.tinted ? "bg-brand/[0.06]" : "bg-card/60")
                  }
                >
                  <f.icon className="size-5 text-brand" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works: full-width 3 columns */}
        <section className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Три шага до первой смены
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.verb} className="flex flex-col gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-medium">{s.verb}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="border-t border-border/60 py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-[24ch] text-2xl font-semibold tracking-tight">
              Готовы подключить свою семью к Reevun?
            </h2>
            <DiscordSignInButton size="lg">
              Войти через Discord
              <ArrowRight className="size-4" />
            </DiscordSignInButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-sm text-muted-foreground md:flex-row md:justify-between">
          <span>Reevun</span>
          <Link
            href="https://github.com/reevun-software/main-bot"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Settings2 className="size-4" strokeWidth={1.5} />
            main-bot на GitHub
          </Link>
        </div>
      </footer>
    </div>
  );
}
