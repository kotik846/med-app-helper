import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Загружаем переменные из .env для локального прокси
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    server: {
      proxy: {
        '/api/yandex': {
          target: 'https://llm.api.cloud.yandex.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/yandex/, '/foundationModels/v1/completion'),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Добавляем заголовки Яндекса для локальной разработки
              proxyReq.setHeader('Authorization', `Api-Key ${env.VITE_API_KEY}`);
              proxyReq.setHeader('x-folder-id', env.VITE_FOLDER_ID);
              proxyReq.setHeader('Content-Type', 'application/json');
            });
          }
        }
      }
    }
  };
});