// "字"的 RSS，中英各一份：/rss.xml 和 /en/rss.xml
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWorks } from './content';
import { kindLabel, localize, ui, type Lang } from './ui';
import { firstLine } from '../scripts/text';

export async function wordsFeed(context: APIContext, lang: Lang) {
  const words = await getWorks('words', lang);
  return rss({
    title: ui[lang]['rss.title'],
    description: ui[lang]['words.sub'],
    site: context.site!,
    customData: `<language>${lang === 'en' ? 'en' : 'zh-CN'}</language>`,
    items: words.map((w) => ({
      title: w.data.title,
      pubDate: w.data.date,
      description: w.data.excerpt ?? firstLine(w.body),
      categories: [kindLabel(w.data.kind, lang)],
      link: localize(`/words/${w.id}/`, lang),
    })),
  });
}
