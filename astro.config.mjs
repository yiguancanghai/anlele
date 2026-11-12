import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';

// sitemap 里只放值得收录的页面
//   - 不放 404
//   - 作品页只放有这种语言原文的（英文页其实是中文原文时不放，免得被当成重复内容）
//   - "影"还没有短片时不放
const ids = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : []);
function worthIndexing(page) {
  const path = new URL(page).pathname;
  if (/\/404\/?$/.test(path)) return false;
  const work = path.match(/^\/(en\/)?(words|sounds)\/([^/]+)\/$/);
  if (work) return ids(`./src/content/${work[2]}/${work[1] ? 'en' : 'zh'}`).includes(work[3]);
  if (/^\/(en\/)?frames\/$/.test(path)) return ['zh', 'en'].some((l) => ids(`./src/content/frames/${l}`).length);
  return true;
}

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

// 英文 404：Cloudflare Pages 在 /en/ 下找的是 /en/404.html，Astro 默认生成的是 /en/404/index.html，构建完挪一下
function englishNotFound() {
  return {
    name: 'anlele-en-404',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const from = new URL('en/404/index.html', dir);
        if (!existsSync(from)) return;
        await rename(from, new URL('en/404.html', dir));
        await rm(new URL('en/404/', dir), { recursive: true });
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
    englishNotFound(),
    sitemap({
      filter: worthIndexing,
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
    }),
  ],
});
