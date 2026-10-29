// Поднимает Ollama в Docker, загружает модель при необходимости и запускает Vite.
import { spawnSync } from "node:child_process";
import { createServer, loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "VITE_");
const MODEL = env.VITE_OLLAMA_MODEL || "qwen3:1.7b";

function run(command, args, { quiet = false } = {}) {
  const result = spawnSync(command, args, {
    stdio: quiet ? "ignore" : "inherit",
  });
  return result.status === 0;
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

console.log("▶ Проверка Docker...");
if (!run("docker", ["info"], { quiet: true })) {
  fail("Docker не запущен. Откройте Docker Desktop и повторите npm run dev.");
}

console.log("▶ Запуск контейнера Ollama...");
if (!run("docker", ["compose", "up", "-d", "--wait", "ollama"])) {
  fail(
    "Не удалось запустить контейнер Ollama. Проверьте: docker compose logs ollama",
  );
}

const hasModel = run(
  "docker",
  ["compose", "exec", "-T", "ollama", "ollama", "show", MODEL],
  { quiet: true },
);

if (hasModel) {
  console.log(`▶ Модель ${MODEL} уже загружена.`);
} else {
  console.log(`▶ Загрузка модели ${MODEL} (только при первом запуске)...`);
  if (!run("docker", ["compose", "exec", "ollama", "ollama", "pull", MODEL])) {
    fail(
      `Не удалось загрузить модель ${MODEL}. Проверьте подключение к интернету.`,
    );
  }
}

const server = await createServer();
await server.listen();
server.printUrls();
server.bindCLIShortcuts({ print: true });
