# Установка и запуск

## Node.js

Проверьте инструменты:

```bash
node --version
npm --version
```

Установите зависимости:

```bash
npm install
```

## Docker и Ollama

Проверьте Docker:

```bash
docker --version
docker compose version
```

Отдельно запускать сервис не нужно: `npm run dev` сам поднимает контейнер и при необходимости загружает модель. Для ручного управления:

```bash
npm run ollama:up
npm run ollama:pull
```

Контейнер использует volume `medical-app_ollama-data`, поэтому модель сохраняется между перезапусками.

Остановить сервис:

```bash
npm run ollama:down
```

## Веб-приложение

Запустите dev-сервер:

```bash
npm run dev
```

Скрипт `scripts/dev.js` проверяет, что Docker запущен, поднимает контейнер Ollama и ждёт его healthcheck, загружает модель из `VITE_OLLAMA_MODEL`, если её ещё нет, и запускает Vite.

После запуска откройте адрес Vite в браузере. Для остановки нажмите `Ctrl+C` в терминале. Контейнер Ollama продолжит работать, остановить его можно командой `npm run ollama:down`.

Только Vite, без Docker: `npm run dev:web`.

## Проверка

```bash
docker compose ps
curl http://localhost:11434/api/tags
```

В списке моделей должна присутствовать `qwen3:1.7b`.
