"use client";

import { useState } from "react";
import { X, ChevronDown, Hash, Volume2, Folder, Megaphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DiscordChannel } from "@/lib/discord-guild";

// Below this, a plain scroll list is faster to scan than typing a query.
const SEARCH_THRESHOLD = 8;

// Discord channel type numbers: 0 text, 2 voice, 4 category, 5 announcement.
function ChannelTypeIcon({ type }: { type: number }) {
  const Icon = type === 2 ? Volume2 : type === 4 ? Folder : type === 5 ? Megaphone : Hash;
  return <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />;
}

export function ChannelPicker({
  id,
  name,
  channels,
  defaultSelectedIds,
  addLabel,
  emptyLabel,
  searchPlaceholder,
}: {
  id?: string;
  name: string;
  channels: DiscordChannel[];
  defaultSelectedIds: string[];
  addLabel: string;
  emptyLabel: string;
  searchPlaceholder?: string;
}) {
  const [selectedIds, setSelectedIds] = useState(
    defaultSelectedIds.filter((channelId) => channels.some((c) => c.id === channelId)),
  );
  const [search, setSearch] = useState("");
  const selected = selectedIds
    .map((id) => channels.find((c) => c.id === id))
    .filter((c): c is DiscordChannel => !!c);
  const visibleChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

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
            id={id}
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
            className="flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-card py-1 pr-1.5 pl-2 text-sm"
          >
            <input type="hidden" name={name} value={channel.id} />
            <ChannelTypeIcon type={channel.type} />
            <span className="max-w-40 truncate">{channel.name}</span>
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
        {channels.length > SEARCH_THRESHOLD && searchPlaceholder && (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={searchPlaceholder}
            className="mb-1 h-7 text-xs"
          />
        )}
        {visibleChannels.map((channel) => (
          <DropdownMenuCheckboxItem
            key={channel.id}
            className="cursor-pointer"
            checked={selectedIds.includes(channel.id)}
            onCheckedChange={(checked) => toggle(channel.id, checked === true)}
          >
            <ChannelTypeIcon type={channel.type} />
            <span className="truncate">{channel.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
