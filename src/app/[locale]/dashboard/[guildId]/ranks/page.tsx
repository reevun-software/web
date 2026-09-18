import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getBotGuildMembers } from "@/lib/bot-api";
import { Card } from "@/components/ui/card";

export default async function RanksPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/ranks">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.ranks");
  const members = await getBotGuildMembers(guildId);
  const ranked = members.filter((m) => m.rank != null);

  if (ranked.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldCheck className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  const byRank = new Map<number, number>();
  for (const m of ranked) byRank.set(m.rank as number, (byRank.get(m.rank as number) ?? 0) + 1);
  const rows = [...byRank.entries()].sort((a, b) => b[0] - a[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-muted-foreground" strokeWidth={1.5} />
          <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t("note")}</p>
      </div>
      <Card className="flex flex-col divide-y divide-border/60 p-0">
        {rows.map(([rank, n]) => (
          <div key={rank} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm font-medium">{t("rank", { n: rank })}</span>
            <span className="text-sm text-muted-foreground">{t("memberCount", { n })}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
