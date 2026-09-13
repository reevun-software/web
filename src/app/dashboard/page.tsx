import Link from "next/link";
import { redirect } from "next/navigation";
import { Layers } from "lucide-react";
import { auth } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/");
  const guilds = await getManageableGuilds(session.accessToken);
  const installed = guilds.filter((g) => g.botInstalled);

  if (installed.length === 1) redirect(`/dashboard/${installed[0].id}`);

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <Layers className="size-8 text-muted-foreground" strokeWidth={1.5} />
      {installed.length === 0 ? (
        <>
          <h1 className="text-xl font-medium">Пока нет семей с Reevun</h1>
          <p className="max-w-[46ch] text-sm text-muted-foreground">
            Вы не управляете ни одним Discord-сервером, где установлен
            Reevun. Установите бота на сервер, где у вас есть права
            администратора, и семья появится здесь.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-medium">Выберите семью</h1>
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
