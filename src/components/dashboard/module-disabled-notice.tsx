import { Lock } from "lucide-react";

// The sidebar already hides/locks a disabled module's nav row, but that's
// cosmetic only - someone with a direct link (or the dashboard overview's
// own stat-card links) could still reach the route underneath it. Every
// module-gated page checks getModuleStates itself and renders this instead
// of its real content when disabled, so the route is actually enforced,
// not just hidden from one entry point.
export function ModuleDisabledNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <Lock className="size-8 text-muted-foreground" strokeWidth={1.5} />
      <h1 className="text-lg font-medium">{title}</h1>
      <p className="max-w-[42ch] text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
