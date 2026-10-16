// 作品的多语言合并
//   - 中文页面：用中文版；没有中文版的作品显示英文原文，标"仅有英文"
//   - 英文页面：用英文版，英文版没写的字段从中文版继承；没有英文版的显示中文原文，标"In Chinese only"
import { getCollection, type CollectionEntry } from 'astro:content';
import type { z } from 'astro/zod';
import { schemas, type Base } from '../schemas';
import type { Lang } from './ui';

export interface Work<B extends Base> {
  id: string; // 文件名，也是网址里的那一段
  data: z.infer<(typeof schemas)[B]> & { translator?: string };
  entry: CollectionEntry<B>; // 正文所在的那个版本，用于 render()
  body: string; // 正文 Markdown 原文
  contentLang: Lang; // 正文实际是哪种语言
  missing: boolean; // 当前语言没有这件作品的版本
  hasZh: boolean;
  hasEn: boolean;
  // 两种语言各自的标题和正文（都有正文时，诗可以开"对照"）
  versions: Partial<Record<Lang, { title: string; body: string; translator?: string }>>;
}

const defined = (o: object) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

// 用完整字段校验；写错时报出是哪个文件
function check<B extends Base>(base: B, data: object, file: string) {
  const result = schemas[base].safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`内容字段有误：src/content/${base}/${file}.md\n${issues}`);
  }
  return result.data as z.infer<(typeof schemas)[B]>;
}

export async function getWorks<B extends Base>(base: B, lang: Lang): Promise<Work<B>[]> {
  const zh = new Map<string, CollectionEntry<B>>();
  const en = new Map<string, CollectionEntry<B>>();
  for (const entry of (await getCollection(base)) as CollectionEntry<B>[]) {
    const [folder, ...rest] = entry.id.split('/');
    (folder === 'en' ? en : zh).set(rest.join('/'), entry);
  }

  const works: Work<B>[] = [];
  for (const id of new Set([...zh.keys(), ...en.keys()])) {
    const z = zh.get(id);
    const e = en.get(id);
    const data = z
      ? check(base, lang === 'en' && e ? { ...z.data, ...defined(e.data) } : z.data, `zh/${id}`)
      : check(base, e!.data, `en/${id}`);
    // 英文页面优先用英文正文；英文版只改了字段、没写正文时，正文仍用中文
    const shown = lang === 'en' ? (e?.body?.trim() ? e : (z ?? e!)) : (z ?? e!);
    works.push({
      id,
      data: { ...data, translator: lang === 'en' ? e?.data.translator : undefined },
      entry: shown,
      body: shown.body ?? '',
      contentLang: shown === e ? 'en' : 'zh',
      missing: lang === 'en' ? !e : !z,
      hasZh: !!z,
      hasEn: !!e,
      versions: {
        zh: z?.body?.trim() ? { title: z.data.title as string, body: z.body } : undefined,
        en: e?.body?.trim()
          ? { title: (e.data.title ?? z?.data.title) as string, body: e.body, translator: e.data.translator }
          : undefined,
      },
    });
  }

  return works
    .filter((w) => !w.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
