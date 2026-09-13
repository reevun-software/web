import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия использования — Reevun",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        Условия использования
      </h1>
      <div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          Reevun — панель управления Discord-ботом для RP-сообществ.
          Пользоваться панелью может любой участник Discord-сервера, где
          установлен бот и у которого есть право «Управление сервером» или
          права администратора.
        </p>
        <p>
          Владелец сервера отвечает за то, кому выдаёт эти права: доступ к
          управлению рангами, предупреждениями и обращениями определяется
          настройками самого Discord-сервера, а не Reevun напрямую.
        </p>
        <p>
          Полная версия условий использования сейчас дорабатывается.
        </p>
      </div>
    </div>
  );
}
