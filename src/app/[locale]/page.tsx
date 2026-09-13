import Image from "next/image";
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
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { DISCORD_BOT_INVITE_URL } from "@/lib/discord";
import { Button } from "@/components/ui/button";
import { DiscordSignInButton } from "@/components/discord-signin-button";
import { Card } from "@/components/ui/card";
import { AccountMenu } from "@/components/account-menu";
import { OAuthPopupButton } from "@/components/auth/oauth-popup-button";
import { HeroBackground } from "@/components/landing/hero-background";
import { Reveal } from "@/components/landing/reveal";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { DisclaimerPopup } from "@/components/landing/disclaimer-popup";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ProjectLink } from "@/components/landing/project-link";

const FEATURE_ICONS = [Users, ShieldCheck, Ticket, ArrowLeftRight, History, Layers];

export default async function Home() {
  const session = await auth();
  const t = await getTranslations();

  const features = t.raw("Features.items") as { title: string; body: string }[];
  const steps = t.raw("HowItWorks.steps") as { verb: string; body: string }[];

  return (
    <div className="flex flex-1 flex-col">
      <HeroBackground />
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
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {session?.user ? (
              <AccountMenu name={session.user.name} image={session.user.image} />
            ) : (
              <DiscordSignInButton size="sm" className="btn-glass">
                <LogIn className="size-4" />
                {t("Header.signIn")}
              </DiscordSignInButton>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: centered, text only */}
        <section>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
            <Reveal>
              <h1 className="text-3xl font-semibold tracking-tight leading-[1.15] md:text-5xl">
                {t("Hero.title")}
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("Hero.subtitle")}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <OAuthPopupButton
                  startUrl={DISCORD_BOT_INVITE_URL}
                  mode="external"
                  size="lg"
                  className="btn-glass"
                >
                  {t("Hero.addBot")}
                  <ArrowRight className="size-4" />
                </OAuthPopupButton>
                <Button render={<Link href="#features" />} variant="ghost" size="lg">
                  {t("Hero.seeFeatures")}
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="pt-2 text-sm text-muted-foreground">
                {t.rich("Hero.availableFor", {
                  majestic: (chunks) => (
                    <ProjectLink project="majestic">{chunks}</ProjectLink>
                  ),
                  gta: (chunks) => <ProjectLink project="gta">{chunks}</ProjectLink>,
                  russia: (chunks) => (
                    <ProjectLink project="russia">{chunks}</ProjectLink>
                  ),
                })}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Features: bento, 6 cells */}
        <section id="features" className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="max-w-[30ch] text-3xl font-semibold tracking-tight">
                {t("Features.heading")}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map((f, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <Reveal key={f.title} delay={i * 0.06}>
                    <Card className="flex h-full flex-col gap-3 border-border/60 bg-card/60 p-6 shadow-none ring-1 ring-transparent transition-colors duration-200 hover:bg-card hover:ring-white/20">
                      <Icon className="size-5 text-foreground" strokeWidth={1.5} />
                      <h3 className="text-lg font-medium">{f.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works: full-width 3 columns */}
        <section id="how-it-works" className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight">
                {t("HowItWorks.heading")}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
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
                {t("Faq.heading")}
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
                {t("Cta.heading")}
              </h2>
              <OAuthPopupButton
                startUrl={DISCORD_BOT_INVITE_URL}
                mode="external"
                size="lg"
                className="btn-glass"
              >
                {t("Cta.addBot")}
                <ArrowRight className="size-4" />
              </OAuthPopupButton>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
      <DisclaimerPopup />
    </div>
  );
}
