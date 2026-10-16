import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { mkdir, writeFile } from 'node:fs/promises';

// 打轴工具（/dev/lrc/），只在 npm run dev 时存在；生产构建里没有这个页面和接口
function devTools() {
  return {
    name: 'anlele-dev-tools',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/dev/lrc', entrypoint: './src/dev/lrc.astro' });
        updateConfig({ vite: { plugins: [saveLrc()] } });
      },
    },
  };
}

// 开发服务器上的"保存 .lrc"接口：POST /__dev/save-lrc  { id, lang, lrc }
function saveLrc() {
  return {
    name: 'anlele-save-lrc',
    configureServer(server) {
      server.middlewares.use('/__dev/save-lrc', async (req, res) => {
        // 只接受 JSON（别的网站无法不经预检就发这种请求）
        if (req.method !== 'POST' || req.headers['content-type'] !== 'application/json') {
          res.statusCode = 400;
          return res.end('bad request');
        }
        let body = '';
        for await (const chunk of req) body += chunk;
        const { id, lang, lrc } = JSON.parse(body);
        if (!/^[a-z0-9-]+$/.test(id) || !['zh', 'en'].includes(lang) || typeof lrc !== 'string') {
          res.statusCode = 400;
          return res.end('bad request');
        }
        const dir = new URL(`./src/content/sounds/${lang}/`, import.meta.url);
        await mkdir(dir, { recursive: true });
        await writeFile(new URL(`${id}.lrc`, dir), lrc);
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ path: `src/content/sounds/${lang}/${id}.lrc` }));
      });
    },
  };
}

// 纯静态输出，部署到 Cloudflare Pages
export default defineConfig({
  site: 'https://anlele.org',
  output: 'static',
  // 中文是默认语言、没有前缀；英文在 /en/ 下。不根据浏览器语言自动跳转
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [
    devTools(),
    sitemap({
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
    }),
  ],
});
