// "字"的 RSS：/rss.xml
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { firstLine } from '../scripts/text';

export async function GET(context: APIContext) {
  const words = (await getCollection('words', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  return rss({
    title: 'anlele · 字',
    description: '诗、读书笔记、随笔',
    site: context.site!,
    customData: '<language>zh-CN</language>',
    items: words.map((w) => ({
      title: w.data.title,
      pubDate: w.data.date,
      description: w.data.excerpt ?? firstLine(w.body),
      categories: [w.data.kind],
      link: `/words/${w.id}/`,
    })),
  });
}
