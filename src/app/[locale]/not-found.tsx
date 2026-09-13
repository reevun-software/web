import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Image src="/logo.png" alt="" width={32} height={32} className="rounded-sm opacity-60" />
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("body")}</p>
      <Button render={<Link href="/" />} variant="ghost">
        <ArrowLeft className="size-4" />
        {t("home")}
      </Button>
    </div>
  );
}
