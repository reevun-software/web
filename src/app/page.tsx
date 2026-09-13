import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { auth } from "@/lib/auth";
import { DISCORD_BOT_INVITE_URL } from "@/lib/discord";
import { Button } from "@/components/ui/button";
import { DiscordSignInButton } from "@/components/discord-signin-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCube } from "@/components/landing/glass-cube";
import { Reveal } from "@/components/landing/reveal";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

const glassButton =
  "rounded-2xl border border-white/10 bg-gradient-to-br from-white/12 to-white/5 text-white backdrop-blur-xl transition-colors duration-200 hover:bg-white/90 hover:text-black shadow-glow";

const FEATURE_SECTIONS = [
  {
    title: "Набор, каким он должен быть",
    body: "Заявки приходят в отдельный канал уже отфильтрованными: проверка на ботов отсекает спам, а профиль заполняется сам по мере ответов.",
    subs: [
      {
        title: "Проверка на ботов",
        body: "CAPTCHA перед подачей заявки — без неё форма недоступна.",
      },
      {
        title: "Статус AFK",
        body: "Участник отмечает отсутствие сам, остальные видят это в профиле.",
      },
    ],
  },
  {
    title: "Модерация на автопилоте",
    body: "Повышения идут по заранее заданной цепочке рангов. Команда /move одним действием переводит выбранных участников между голосовыми каналами.",
    subs: [
      {
        title: "Ранги по цепочке",
        body: "Следующий ранг доступен, только когда пройден предыдущий.",
      },
      {
        title: "Автовыход после 3 предупреждений",
        body: "Роль снимается сама, без ручного вмешательства модератора.",
      },
    ],
  },
  {
    title: "Всё видно, ничего не теряется",
    body: "Одна панель на несколько семей сразу: переключаетесь между серверами тем же аккаунтом, без повторного входа.",
    subs: [
      {
        title: "Обращения и апелляции",
        body: "Тикеты с понятным номером и историей переписки.",
      },
      {
        title: "Журнал действий",
        body: "Кто выдал ранг, снял предупреждение или закрыл тикет — видно в панели.",
      },
    ],
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-6">
          <span className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Reevun"
              width={22}
              height={22}
              className="rounded-sm"
              priority
            />
            <span className="text-base font-semibold tracking-tight">
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
            <DiscordSignInButton size="sm" className={glassButton}>
              <LogIn className="size-4" />
              Войти через Discord
            </DiscordSignInButton>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_oklch,var(--brand)_25%,transparent),transparent)]"
          />
          <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-16 pb-10 md:min-h-[80vh] md:grid-cols-2 md:items-center md:pt-20">
            <div className="order-2 flex flex-col gap-6 md:order-1">
              <h1 className="font-serif text-gradient-sheen text-[2.75rem] leading-[1.05] tracking-tight md:text-[4.5rem]">
                Управляйте
                <br />
                Discord-сообществом
              </h1>
              <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg">
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
                  className={glassButton}
                >
                  Добавить бота на сервер
                  <ArrowRight className="size-4" />
                </Button>
                <Button render={<Link href="#features" />} variant="ghost" size="lg">
                  Смотреть возможности
                </Button>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <GlassCube />
            </div>
          </div>

          <p className="mx-auto max-w-7xl px-6 pb-16 text-center text-sm text-muted-foreground">
            Уже используют команды MajesticRP GTA5RP и Россия Онлайн
          </p>
        </section>

        {/* Feature sections, resend-style: main claim + two proof points */}
        <div id="features">
          {FEATURE_SECTIONS.map((section, si) => (
            <section
              key={section.title}
              className={
                si === 0
                  ? "py-12 sm:py-24"
                  : "mt-20 rounded-3xl border-t border-white/5 py-12 sm:py-24"
              }
            >
              <div className="mx-auto max-w-7xl px-6">
                <Reveal>
                  <h2 className="max-w-[22ch] font-serif text-[2rem] leading-[1.15] tracking-tight md:text-[2.75rem]">
                    {section.title}
                  </h2>
                  <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                    {section.body}
                  </p>
                </Reveal>
                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  {section.subs.map((sub, i) => (
                    <Reveal key={sub.title} delay={i * 0.08}>
                      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                        <h3 className="text-lg font-medium">{sub.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {sub.body}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* FAQ */}
        <section
          id="faq"
          className="mt-20 rounded-3xl border-t border-white/5 py-12 sm:py-24"
        >
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <h2 className="font-serif text-[2rem] tracking-tight md:text-[2.75rem]">
                Частые вопросы
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <Faq />
            </Reveal>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mt-20 rounded-3xl border-t border-white/5 py-12 sm:py-24">
          <Reveal>
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 text-center">
              <h2 className="text-hollow font-serif text-[2.5rem] tracking-tight md:text-[3.5rem]">
                Готовы подключить свою семью?
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
                className={glassButton}
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
