"use client";

import { useState } from "react";

// A native <input type="color"> already submits its value as a hex string
// via FormData - no client JS needed for that part. This just adds a
// visible hex readout next to the swatch, since the native picker's own UI
// hides the value until you open it.
export function ColorInput({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex w-fit items-center gap-2 rounded-md border border-input bg-transparent px-2.5 py-1.5 dark:bg-input/30">
      <input
        type="color"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="size-5 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:rounded-full [&::-webkit-color-swatch-wrapper]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
      />
      <span className="font-mono text-sm uppercase">{value}</span>
    </div>
  );
}
