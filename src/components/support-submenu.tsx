"use client";

import { LifeBuoy, MessageCircle } from "lucide-react";
import Intercom, { show } from "@intercom/messenger-js-sdk";
import { SUPPORT_DISCORD_URL } from "@/lib/discord";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

// The Messenger only boots the first time "Online chat" is actually
// clicked, not on every page load - previously it auto-booted globally with
// a floating launcher bubble visible to every visitor, which is more than
// what was asked for ("chat only for signed-in users, only from Support").
// Intercom() itself only inits once (guarded internally by the SDK), so a
// second click just re-shows the already-booted messenger.
export function SupportSubmenu({
  label,
  discordLabel,
  chatLabel,
  userId,
  name,
  userJwt,
}: {
  label: string;
  discordLabel: string;
  chatLabel: string;
  userId?: string;
  name?: string;
  userJwt?: string;
}) {
  function openChat() {
    if (!APP_ID) return;
    Intercom({
      app_id: APP_ID,
      hide_default_launcher: true,
      ...(userId && { user_id: userId }),
      ...(name && { name }),
      ...(userJwt && { intercom_user_jwt: userJwt }),
    });
    show();
  }

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
          {discordLabel}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={openChat}>
          <MessageCircle className="size-4" strokeWidth={1.5} />
          {chatLabel}
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
