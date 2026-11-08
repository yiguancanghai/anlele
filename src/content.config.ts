// 内容集合：每类作品一个文件夹，下分 zh/（中文，主版本）和 en/（英文，可选）
// 同一件作品两种语言用同一个文件名，比如 words/zh/huanghun.md 和 words/en/huanghun.md
// 字段写错时构建会报错并指出文件（完整校验在 src/i18n/content.ts）
import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { hasWorks, schemas, type Base } from './schemas';

// 某一类暂时一件作品都没有时（比如还没放短片），跳过加载
// 放进第一件作品后，如果开着 npm run dev，需要重启一次才能看到
function works(base: Base): Loader {
  const loader = glob({ pattern: '{zh,en}/*.md', base: `./src/content/${base}` });
  return { name: 'works', load: async (ctx) => (hasWorks(base) ? loader.load(ctx) : undefined) };
}

const collection = (base: Base) =>
  defineCollection({
    loader: works(base),
    // 英文版可以只写部分字段，另可写译者
    schema: schemas[base].partial().extend({ translator: z.string().optional() }),
  });

export const collections = {
  words: collection('words'),
  sounds: collection('sounds'),
  frames: collection('frames'),
  build: collection('build'),
};
