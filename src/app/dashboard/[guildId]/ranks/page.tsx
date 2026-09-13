import { ShieldCheck } from "lucide-react";

export default function RanksPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <ShieldCheck className="size-8 text-muted-foreground" strokeWidth={1.5} />
      <h1 className="text-lg font-medium">Ранги и предупреждения</h1>
      <p className="max-w-[42ch] text-sm text-muted-foreground">
        Здесь появится цепочка рангов и журнал предупреждений, как только
        участники начнут получать их через бота.
      </p>
    </div>
  );
}
