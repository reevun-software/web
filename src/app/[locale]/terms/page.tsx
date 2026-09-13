import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });
  return { title: t("metaTitle") };
}

export default async function TermsPage() {
  const t = await getTranslations("Terms");

  return (
    <LegalPage
      title={t("title")}
      updated={t("updated")}
      sections={t.raw("sections")}
    />
  );
}
