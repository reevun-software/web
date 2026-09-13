"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authErrorNumericCode, authErrorReasonKey } from "@/lib/auth-error-codes";

function AuthErrorContent() {
  const params = useSearchParams();
  const code = params.get("error") ?? "Default";
  const t = useTranslations("Auth");
  const reasonKey = authErrorReasonKey(code);

  // Reached either inside the sign-in popup (Discord redirected here after a
  // denied/failed authorization) or directly, e.g. a bookmarked link. Only
  // the popup case has an opener to report back to and close itself for.
  useEffect(() => {
    if (!window.opener) return;
    window.opener.postMessage({ source: "reevun-oauth", status: "error", code }, window.location.origin);
    window.close();
  }, [code]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">{t("errorTitle")}</h1>
      <p className="max-w-[40ch] text-sm text-muted-foreground">{t(`errorReasons.${reasonKey}`)}</p>
      <p className="text-xs text-muted-foreground">
        {t("errorCode", { code: authErrorNumericCode(code) })}
      </p>
      <Button render={<Link href="/" />} variant="ghost" size="sm">
        {t("backHome")}
      </Button>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  );
}
