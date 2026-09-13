"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function AuthPopupCompletePage() {
  const t = useTranslations("Auth");

  useEffect(() => {
    window.opener?.postMessage({ source: "reevun-oauth", status: "success" }, window.location.origin);
    window.close();
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6 text-center text-sm text-muted-foreground">
      {t("closeWindow")}
    </div>
  );
}
