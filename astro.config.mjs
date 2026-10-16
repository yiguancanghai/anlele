import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
    sitemap({
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
    }),
  ],
});
