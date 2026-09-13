import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function RanksPage() {
  const t = await getTranslations("Dashboard.ranks");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <ShieldCheck className="size-8 text-muted-foreground" strokeWidth={1.5} />
      <h1 className="text-lg font-medium">{t("title")}</h1>
      <p className="max-w-[42ch] text-sm text-muted-foreground">{t("body")}</p>
    </div>
  );
}
