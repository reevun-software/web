import { desc } from "drizzle-orm";
import { Newspaper } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";

export default async function NewsPage() {
  const [t, locale] = await Promise.all([
    getTranslations("Dashboard.news"),
    getLocale(),
  ]);
  const entries = await db.select().from(news).orderBy(desc(news.publishedAt)).limit(50);

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <Newspaper className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Newspaper className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="flex flex-col gap-2 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-medium">{entry.title}</h2>
              <span className="shrink-0 text-xs text-muted-foreground">
                {entry.publishedAt.toLocaleDateString(locale)}
              </span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {entry.body}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
