"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Intercom, { update } from "@intercom/messenger-js-sdk";

const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

// Boots on every page (marketing + dashboard) per the site's own choice.
// userId/name/userJwt come from the signed-in session at the root layout -
// already resolved server-side by the time this mounts, so one boot call is
// enough; no need to re-init on session changes.
export function IntercomWidget({
  userId,
  name,
  userJwt,
}: {
  userId?: string;
  name?: string;
  userJwt?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!APP_ID) return;
    Intercom({
      app_id: APP_ID,
      ...(userId && { user_id: userId }),
      ...(name && { name }),
      ...(userJwt && { intercom_user_jwt: userJwt }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot only needs to run once with whatever session data was available on mount
  }, []);

  useEffect(() => {
    if (APP_ID) update({});
  }, [pathname]);

  return null;
}
