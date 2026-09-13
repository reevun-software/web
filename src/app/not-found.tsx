import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Image src="/logo.png" alt="" width={32} height={32} className="rounded-sm opacity-60" />
      <h1 className="text-2xl font-semibold tracking-tight">Страница не найдена</h1>
      <p className="text-sm text-muted-foreground">
        Такой страницы нет, либо она была перемещена.
      </p>
      <Button render={<Link href="/" />} variant="ghost">
        <ArrowLeft className="size-4" />
        На главную
      </Button>
    </div>
  );
}
