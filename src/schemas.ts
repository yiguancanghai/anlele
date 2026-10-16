// 每类作品的完整字段。中文版必须写全；英文版只写和中文不同的字段，其余从中文版继承
// （合并和校验在 src/i18n/content.ts）
import { z } from 'astro/zod';

export const schemas = {
  // 字：诗、读书笔记、随笔
  words: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['诗', '读书笔记', '随笔']),
    excerpt: z.string().optional(), // 列表里的摘录，不写就取正文首行
    book: z.string().optional(), // 读书笔记用
    author: z.string().optional(), // 读书笔记用
    draft: z.boolean().optional(),
  }),

  // 声：歌。正文是歌词和创作说明
  sounds: z.object({
    title: z.string(),
    date: z.coerce.date(),
    audio: z.string(), // 音频地址，如 https://media.anlele.org/xxx.mp3
    duration: z.number(), // 秒
    note: z.string(), // 一行说明
    cover: z.string().optional(),
    tools: z.array(z.string()).optional(),
    related: z.string().optional(), // 关联的诗，写 words 里的文件名（不带 .md）
    draft: z.boolean().optional(),
  }),

  // 影：短片（以后加摄影）。正文是简介
  frames: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['短片', '摄影']),
    bvid: z.string().optional(), // B站视频号，BV 开头
    duration: z.string().optional(), // 如 "3:20"
    cover: z.string().optional(),
    draft: z.boolean().optional(),
  }),

  // 造：App 和其他项目。featured 的那个正文是"为什么做它"
  build: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tagline: z.string(),
    url: z.url().optional(),
    featured: z.boolean().optional(),
    features: z.array(z.string()).optional(),
    screenshot: z.string().optional(),
    stack: z.string().optional(),
    draft: z.boolean().optional(),
  }),
};

export type Base = keyof typeof schemas;
