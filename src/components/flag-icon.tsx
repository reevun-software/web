// flag-icons' own stylesheet sets width via `.fi.fis` (two classes), which
// beats a plain Tailwind utility class like `size-4` on specificity - the
// utility silently never applied. An inline style always wins instead.
const FLAG_SIZE = { width: 16, height: 16 } as const;

export function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} fis shrink-0 rounded-[3px]`} style={FLAG_SIZE} />;
}
