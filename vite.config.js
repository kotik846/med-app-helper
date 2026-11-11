import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const root = process.cwd();
const pages = ['index.html', 'blog.html', 'studio.html'].filter(f => existsSync(resolve(root, f)));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  return {
    plugins: [{
      name: 'medii-nav',
      transformIndexHtml(html, ctx) {
        const p = ctx.path || '';
        const tags = [];
        if (p === '/' || p === '/index.html' || /studio\.html/.test(p) || /blog\.html/.test(p)) {
          tags.push({ tag: 'script', attrs: { type: 'module', src: '/js/nav.js' }, injectTo: 'body' });
        }
        if (/blog\.html/.test(p)) tags.push({ tag: 'script', attrs: { type: 'module', src: '/js/deeplink.js' }, injectTo: 'body' });
        return { html, tags };
      },
    }],
    optimizeDeps: { entries: pages.map(f => resolve(root, f)) },
    server: {
      proxy: {
        '/api/yandex': {
          target: 'https://llm.api.cloud.yandex.net/foundationModels/v1',
          changeOrigin: true, timeout: 12000, proxyTimeout: 12000,
          rewrite: p => p.replace(/^\/api\/yandex/, '/completion'),
          headers: env.VITE_API_KEY ? { Authorization: `Api-Key ${env.VITE_API_KEY}` } : {},
        },
        '/api/v1': { target: 'https://blog-api-zeta-green.vercel.app', changeOrigin: true, timeout: 8000, proxyTimeout: 8000 },
      },
    },
    build: { rollupOptions: { input: Object.fromEntries(pages.map(f => [f.replace('.html', ''), resolve(root, f)])) } },
  };
});