"use client";

import { useState } from "react";
import { X, ChevronDown, Hash, Volume2, Folder, Megaphone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DiscordChannel } from "@/lib/discord-guild";

// Discord channel type numbers: 0 text, 2 voice, 4 category, 5 announcement.
function ChannelTypeIcon({ type }: { type: number }) {
  const Icon = type === 2 ? Volume2 : type === 4 ? Folder : type === 5 ? Megaphone : Hash;
  return <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />;
}

export function ChannelPicker({
  name,
  channels,
  defaultSelectedIds,
  addLabel,
  emptyLabel,
}: {
  name: string;
  channels: DiscordChannel[];
  defaultSelectedIds: string[];
  addLabel: string;
  emptyLabel: string;
}) {
  const [selectedIds, setSelectedIds] = useState(
    defaultSelectedIds.filter((id) => channels.some((c) => c.id === id)),
  );
  const selected = selectedIds
    .map((id) => channels.find((c) => c.id === id))
    .filter((c): c is DiscordChannel => !!c);

  if (channels.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  function toggle(channelId: string, checked: boolean) {
    setSelectedIds((ids) => (checked ? [...ids, channelId] : ids.filter((id) => id !== channelId)));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <div
            role="button"
            tabIndex={0}
            className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-left text-sm cursor-pointer dark:bg-input/30 dark:hover:bg-input/50"
          />
        }
      >
        {selected.length === 0 && <span className="px-1 text-muted-foreground">{addLabel}</span>}
        {selected.map((channel) => (
          <span
            key={channel.id}
            className="flex items-center gap-1.5 rounded-md border border-border/60 bg-card py-1 pr-1.5 pl-2 text-sm"
          >
            <input type="hidden" name={name} value={channel.id} />
            <ChannelTypeIcon type={channel.type} />
            {channel.name}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggle(channel.id, false);
              }}
              className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <ChevronDown className="ml-auto size-3.5 shrink-0 self-center text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="max-h-64 w-(--anchor-width)">
        {channels.map((channel) => (
          <DropdownMenuCheckboxItem
            key={channel.id}
            className="cursor-pointer"
            checked={selectedIds.includes(channel.id)}
            onCheckedChange={(checked) => toggle(channel.id, checked === true)}
          >
            <ChannelTypeIcon type={channel.type} />
            {channel.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
