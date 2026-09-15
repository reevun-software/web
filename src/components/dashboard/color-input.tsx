"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// A native <input type="color"> hands off to the OS's own color chooser on
// click, which looks nothing like the rest of the app and can't be
// restyled - this stays entirely inside our own popover instead: a preset
// swatch grid plus a hex field, submitted via a hidden input.
const PRESET_COLORS = [
  "#79040C",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
];

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function ColorInput({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [draft, setDraft] = useState(defaultValue);

  function commit(next: string) {
    const normalized = next.startsWith("#") ? next : `#${next}`;
    if (HEX_PATTERN.test(normalized)) {
      setValue(normalized);
      setDraft(normalized);
    } else {
      setDraft(value); // reject an invalid typed value, snap back to the last good one
    }
  }

  return (
    <DropdownMenu>
      <input type="hidden" name={name} value={value} />
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 dark:bg-input/30 dark:hover:bg-input/50"
          />
        }
      >
        <span
          className="size-5 shrink-0 rounded-full ring-1 ring-foreground/10"
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <span className="font-mono text-sm uppercase">{value}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-3">
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => commit(c)}
              className="size-7 cursor-pointer rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
            }
          }}
          className="mt-3 font-mono uppercase"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
