# Reevun web

Панель управления Discord-ботом Reevun. Next.js + Discord OAuth (Auth.js) + Postgres (Drizzle).

## Разработка

```bash
npm install
npm run dev
```

Переменные окружения — см. `.env.example`. Локально держи их в `.env.local` (не коммитится).

## База данных

```bash
npm run db:push      # накатить схему из src/lib/db/schema.ts
npm run db:generate  # сгенерировать миграцию
```

## Тесты

```bash
npm test
```

## Деплой

Railway, сервис `web` в проекте `reevun-app` (https://reevun.app). Деплой идёт из ветки `main` этого репозитория.
