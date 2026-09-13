import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { PROJECT_URLS } from "@/lib/projects";
import { LeavingRedirect } from "@/components/leaving-redirect";

const PROJECT_LABELS: Record<keyof typeof PROJECT_URLS, string> = {
  majestic: "MajesticRP",
  gta: "GTA 5 RP",
  russia: "Russia Online",
};

function isKnownProject(value: string): value is keyof typeof PROJECT_URLS {
  return value in PROJECT_URLS;
}

export default async function LeavingPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  const t = await getTranslations("Leaving");

  // Only ever redirect to one of our own known project URLs - never an
  // arbitrary query value, which would otherwise be an open redirect.
  if (!project || !isKnownProject(project)) {
    redirect({ href: "/", locale: await getLocale() });
    throw new Error("unreachable");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("body", { site: PROJECT_LABELS[project] })}
      </p>
      <LeavingRedirect targetUrl={PROJECT_URLS[project]} />
    </div>
  );
}
