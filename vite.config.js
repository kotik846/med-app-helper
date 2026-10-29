import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/yandex': {
        target: 'https://llm.api.cloud.yandex.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yandex/, ''),
      },
    },
  },
});