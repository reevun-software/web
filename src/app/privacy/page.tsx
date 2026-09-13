import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Reevun",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        Политика конфиденциальности
      </h1>
      <div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          Вход на сайт выполняется только через Discord OAuth. Мы получаем от
          Discord ваш идентификатор пользователя, имя, аватар и список
          серверов, которыми вы управляете, — этого достаточно, чтобы
          показать вам только те семьи, где установлен Reevun и у вас есть
          права администратора.
        </p>
        <p>
          Данные участников семьи (профили, ранги, предупреждения, тикеты)
          собирает сам бот на вашем Discord-сервере и хранит в базе данных
          Reevun. Эти данные видны только тем, у кого есть права управления
          этим сервером.
        </p>
        <p>
          Полная версия политики конфиденциальности сейчас дорабатывается.
        </p>
      </div>
    </div>
  );
}
