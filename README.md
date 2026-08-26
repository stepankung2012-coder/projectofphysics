# Дневник проекта по физике

Фронтовый прототип приложения для сопровождения проектной деятельности школьников по физике.

## Локальный запуск

```bash
npm install
npm run dev
```

## GitHub Pages

Перед публикацией у репозитория должен быть настроен remote `origin`.

```bash
npm run deploy
```

Скрипт `deploy` сначала собирает проект с относительными путями через `build:pages`, затем публикует папку `dist` в ветку `gh-pages`.

## Миграции Supabase

SQL-файлы из `supabase/migrations` выполняются в Supabase SQL Editor по порядку. Для загрузки материалов проекта необходимо применить `20260826_project_files.sql`: миграция создаёт приватный bucket `project-files`, ограничивает размер файла 10 МБ и разрешает доступ только участникам соответствующего проекта.

Для журнала изменений необходимо применить `20260826_stage_history.sql`.

## Настоящий ИИ-помощник

1. Создайте и разверните Supabase Edge Function `ai-assistant` из `supabase/functions/ai-assistant/index.ts`.
2. В Supabase Edge Function Secrets добавьте `OPENAI_API_KEY`.
3. Необязательно добавьте `OPENAI_MODEL`; по умолчанию используется `gpt-5.4-mini`.

Секретный ключ OpenAI не должен попадать в исходный код, `.env` клиента или GitHub Pages.
