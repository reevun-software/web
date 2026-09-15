"use client";

import { useEffect } from "react";
import { LifeBuoy, MessageCircle, Mail, BookOpen } from "lucide-react";
import Intercom, { show } from "@intercom/messenger-js-sdk";
import { SUPPORT_DISCORD_URL, DOCS_URL, SUPPORT_EMAIL } from "@/lib/discord";
import { DiscordIcon } from "@/components/icons/discord-icon";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

export function SupportSubmenu({
  label,
  discordLabel,
  docsLabel,
  emailLabel,
  chatLabel,
  userId,
  name,
  userJwt,
}: {
  label: string;
  discordLabel: string;
  docsLabel: string;
  emailLabel: string;
  chatLabel: string;
  userId?: string;
  name?: string;
  userJwt?: string;
}) {
  // Boots quietly (hide_default_launcher: true, so no floating bubble) as
  // soon as this submenu mounts - i.e. once Account menu is opened, a
  // couple of clicks before "Online chat" is actually pressed. Intercom()
  // itself only inits once (guarded internally by the SDK), so this just
  // gives the remote widget script a head start instead of loading it
  // synchronously on the click itself, which was the slow part.
  useEffect(() => {
    if (!APP_ID) return;
    Intercom({
      app_id: APP_ID,
      hide_default_launcher: true,
      ...(userId && { user_id: userId }),
      ...(name && { name }),
      ...(userJwt && { intercom_user_jwt: userJwt }),
    });
  }, [userId, name, userJwt]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <LifeBuoy className="size-4" strokeWidth={1.5} />
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem
          render={<a href={SUPPORT_DISCORD_URL} target="_blank" rel="noopener noreferrer" />}
          className="cursor-pointer"
        >
          <DiscordIcon className="size-4 text-white" />
          {discordLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<a href={DOCS_URL} target="_blank" rel="noopener noreferrer" />}
          className="cursor-pointer"
        >
          <BookOpen className="size-4" strokeWidth={1.5} />
          {docsLabel}
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={`mailto:${SUPPORT_EMAIL}`} />} className="cursor-pointer">
          <Mail className="size-4" strokeWidth={1.5} />
          {emailLabel}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => show()}>
          <MessageCircle className="size-4" strokeWidth={1.5} />
          {chatLabel}
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
