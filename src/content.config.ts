// 内容集合：每类作品一个文件夹，下分 zh/（中文，主版本）和 en/（英文，可选）
// 同一件作品两种语言用同一个文件名，比如 words/zh/yehang.md 和 words/en/yehang.md
// 字段写错时构建会报错并指出文件（完整校验在 src/i18n/content.ts）
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { schemas, type Base } from './schemas';

const collection = (base: Base) =>
  defineCollection({
    loader: glob({ pattern: '{zh,en}/*.md', base: `./src/content/${base}` }),
    // 英文版可以只写部分字段，另可写译者
    schema: schemas[base].partial().extend({ translator: z.string().optional() }),
  });

export const collections = {
  words: collection('words'),
  sounds: collection('sounds'),
  frames: collection('frames'),
  build: collection('build'),
};
