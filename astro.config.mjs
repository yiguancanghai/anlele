import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 纯静态输出，部署到 Cloudflare Pages
export default defineConfig({
  site: 'https://anlele.org',
  output: 'static',
  integrations: [sitemap()],
});
