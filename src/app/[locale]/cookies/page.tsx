import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cookies" });
  return { title: t("metaTitle") };
}

export default async function CookiesPage() {
  const t = await getTranslations("Cookies");

  return (
    <LegalPage
      title={t("title")}
      updated={t("updated")}
      intro={t("intro")}
      sections={t.raw("sections")}
    />
  );
}
