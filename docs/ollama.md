# Ollama в Docker

## Сервис

Конфигурация находится в `docker-compose.yml`:

- образ: `ollama/ollama:latest`;
- контейнер: `medical-app-ollama`;
- API: `http://localhost:11434`;
- volume: `ollama-data` для `/root/.ollama`;
- автоматический перезапуск: `unless-stopped`;
- healthcheck: `ollama list`, его ждёт `npm run dev`.

## Управление

```bash
npm run ollama:up
npm run ollama:pull
npm run ollama:down
```

Список моделей:

```bash
docker compose exec ollama ollama list
```

Проверка API:

```bash
curl http://localhost:11434/api/tags
```

## Место на диске

Docker-образ и модель занимают место в хранилище Docker, а не в Homebrew. Для просмотра использования:

```bash
docker system df
```

Удаление контейнера вместе с моделью и volume:

```bash
docker compose down -v
```

Команда `down -v` удаляет скачанную модель, поэтому используйте её только если нужно полностью очистить локальные данные Ollama.
