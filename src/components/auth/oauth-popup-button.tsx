"use client";

import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authErrorNumericCode, authErrorReasonKey } from "@/lib/auth-error-codes";

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 720;

type OAuthMessage =
  | { source: "reevun-oauth"; status: "success" }
  | { source: "reevun-oauth"; status: "error"; code: string };

function isOAuthMessage(data: unknown): data is OAuthMessage {
  return !!data && typeof data === "object" && (data as { source?: unknown }).source === "reevun-oauth";
}

function isMobileBrowser() {
  return /iphone|ipod|ipad|android/i.test(navigator.userAgent);
}

type Mode =
  // Popup navigates through our own sign-in + success/error pages, which
  // postMessage the outcome back before closing themselves.
  | "message"
  // Popup goes straight to Discord's own invite/consent flow. We have no
  // redirect_uri wired into that page, so there is no way to learn whether
  // it actually succeeded - only that the window closed. Refresh and move
  // on rather than fabricate a success/error we can't verify.
  | "external";

type OAuthPopupButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  startUrl: string;
  mode: Mode;
};

export function OAuthPopupButton({ startUrl, mode, children, ...props }: OAuthPopupButtonProps) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const t = useTranslations("Auth");
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  useEffect(() => {
    if (mode !== "message") return;

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || !isOAuthMessage(event.data)) return;
      stopPolling();
      setPending(false);
      popupRef.current?.close();
      popupRef.current = null;

      if (event.data.status === "success") {
        router.refresh();
        return;
      }
      const reasonKey = authErrorReasonKey(event.data.code);
      toast.error(t("errorTitle"), {
        description: `${t(`errorReasons.${reasonKey}`)} ${t("errorCode", { code: authErrorNumericCode(event.data.code) })}`,
      });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mode, router, stopPolling, t]);

  function handleClick() {
    // Mobile browsers (Safari on iOS especially) don't give window.open a
    // real popup window - it either silently opens a full new tab or the
    // auto-submit inside it runs outside the click's user-gesture window and
    // gets blocked, landing on a broken Discord auth state either way. Skip
    // the popup there and fall back to the plain top-level redirect that
    // already worked before this flow existed.
    if (isMobileBrowser()) {
      window.location.href = mode === "message" ? `${startUrl}?direct=1` : startUrl;
      return;
    }

    const left = window.screenX + Math.max(0, (window.outerWidth - POPUP_WIDTH) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - POPUP_HEIGHT) / 2);
    const popup = window.open(
      startUrl,
      "reevun-oauth",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`,
    );

    if (!popup) {
      toast.error(t("popupBlocked"));
      return;
    }

    popupRef.current = popup;
    setPending(true);
    pollRef.current = setInterval(() => {
      if (!popup.closed) return;
      stopPolling();
      setPending(false);
      popupRef.current = null;
      if (mode === "external") router.refresh();
    }, 500);
  }

  return (
    <>
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>
      {pending &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            aria-hidden
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          >
            <Loader2 className="size-8 animate-spin text-foreground" />
          </div>,
          document.body,
        )}
    </>
  );
}
