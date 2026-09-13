import { Layers } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const locale = await getLocale();
  const session = await auth();
  if (!session?.accessToken) {
    redirect({ href: "/", locale });
    throw new Error("unreachable"); // proves accessToken is defined below to tsc
  }
  const guilds = await getManageableGuilds(session.accessToken);
  const installed = guilds.filter((g) => g.botInstalled);
  const t = await getTranslations("Dashboard");

  if (installed.length === 1)
    redirect({ href: `/dashboard/${installed[0].id}`, locale });

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <Layers className="size-8 text-muted-foreground" strokeWidth={1.5} />
      {installed.length === 0 ? (
        <>
          <h1 className="text-xl font-medium">{t("noFamiliesTitle")}</h1>
          <p className="max-w-[46ch] text-sm text-muted-foreground">
            {t("noFamiliesBody")}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-medium">{t("chooseFamilyTitle")}</h1>
          <div className="flex w-full flex-col gap-2">
            {installed.map((g) => (
              <Card key={g.id} className="p-0">
                <Link
                  href={`/dashboard/${g.id}`}
                  className="block px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent/60"
                >
                  {g.name}
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
