// scripts/dev.js
import { createServer, loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "VITE_");

console.log("▶ Запуск локального сервера разработки (Vite)...");
console.log("▶ Нейросеть работает через облачный API (Docker и Ollama не нужны).");

const server = await createServer();
await server.listen();
server.printUrls();
server.bindCLIShortcuts({ print: true });