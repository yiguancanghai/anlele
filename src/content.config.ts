// 内容模型：每个集合一个文件夹，每件作品一个 Markdown 文件
// 字段写错（比如 kind 拼错、漏了 title）时，构建会直接报错
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const md = (dir: string) => glob({ pattern: '*.md', base: `./src/content/${dir}` });

// 字：诗、读书笔记、随笔
const words = defineCollection({
  loader: md('words'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['诗', '读书笔记', '随笔']),
    excerpt: z.string().optional(), // 列表里的摘录，不写就取正文首行
    book: z.string().optional(), // 读书笔记用
    author: z.string().optional(), // 读书笔记用
    draft: z.boolean().optional(),
  }),
});

// 声：歌。正文留给歌词和创作说明
const sounds = defineCollection({
  loader: md('sounds'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    audio: z.string(), // 音频地址，如 /audio/xxx.wav 或 https://media.anlele.org/xxx.mp3
    duration: z.number(), // 秒
    note: z.string(), // 一行说明
    cover: z.string().optional(),
    tools: z.array(z.string()).optional(),
    related: z.string().optional(), // 关联的诗，写 words 里的文件名（不带 .md）
    draft: z.boolean().optional(),
  }),
});

// 影：短片（以后加摄影）。正文是简介
const frames = defineCollection({
  loader: md('frames'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['短片', '摄影']),
    bvid: z.string().optional(), // B站视频号，BV 开头
    duration: z.string().optional(), // 如 "3:20"
    cover: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

// 造：App 和其他项目。featured 的那个正文是"为什么做它"
const build = defineCollection({
  loader: md('build'),
  schema: z.object({
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
});

export const collections = { words, sounds, frames, build };
