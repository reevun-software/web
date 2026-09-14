"use client";

import { useState } from "react";
import { X, Plus, Hash, Volume2, Folder, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const available = channels.filter((c) => !selectedIds.includes(c.id));

  if (channels.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => setSelectedIds((ids) => ids.filter((id) => id !== channel.id))}
            className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {available.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="cursor-pointer gap-1">
                <Plus className="size-3.5" />
                {addLabel}
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="max-h-64 w-56">
            {available.map((channel) => (
              <DropdownMenuItem
                key={channel.id}
                className="cursor-pointer"
                onClick={() => setSelectedIds((ids) => [...ids, channel.id])}
              >
                <ChannelTypeIcon type={channel.type} />
                {channel.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
