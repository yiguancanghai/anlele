// 歌词（构建时用）
//   - 同步歌词：歌的 md 旁边放一个同名 .lrc 文件，如 sounds/zh/chaoxi.lrc（英文歌词或英译放 sounds/en/）
//   - 歌词纯文本：写在 md 正文里的 ```lyrics 代码块中（打轴工具读它；页面上不当作创作说明显示）
import type { Lang } from '../i18n/ui';
import { tokenize } from './poem';

export interface LyricLine {
  t: number; // 这一句开始的时间（秒）
  text: string; // 空字符串表示间奏
}

const files = import.meta.glob<string>('/src/content/sounds/*/*.lrc', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// 解析 LRC：支持一行多个时间点、[offset:毫秒]（正数让歌词整体提前，LRC 的惯例）
export function parseLrc(text: string): LyricLine[] {
  let offset = 0;
  const lines: LyricLine[] = [];
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const off = raw.match(/^\[offset:\s*([+-]?\d+)\s*\]/i);
    if (off) {
      offset = Number(off[1]) / 1000;
      continue;
    }
    const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    if (!stamps.length) continue; // 其他标签（[ti:] [ar:] 等）忽略
    const words = raw.replace(/\[[^\]]*\]/g, '').trim();
    for (const m of stamps) lines.push({ t: Number(m[1]) * 60 + Number(m[2]), text: words });
  }
  return lines.map((l) => ({ ...l, t: Math.max(0, l.t - offset) })).sort((a, b) => a.t - b.t);
}

// 某首歌某种语言的同步歌词；没有对应语言的 .lrc 就返回 undefined
export function getLyrics(id: string, lang: Lang): LyricLine[] | undefined {
  const text = files[`/src/content/sounds/${lang}/${id}.lrc`];
  return text ? parseLrc(text) : undefined;
}

// md 正文里 ```lyrics 代码块的内容（歌词纯文本）
export function lyricsBlock(body: string): string | undefined {
  return body.match(/```lyrics\n([\s\S]*?)\n```/)?.[1];
}

// 单曲页上当前句逐字出现：整句在约 0.6–1 秒内出现完（句子之间间隔短时更快）
export function lineTokens(text: string, gap: number) {
  const parts = tokenize(text);
  const count = parts.filter((p) => !/^\s+$/.test(p)).length || 1;
  const span = Math.min(1000, Math.max(600, gap * 1000 * 0.5));
  const step = span / count;
  let i = 0;
  return parts.map((p) => (/^\s+$/.test(p) ? { text: p } : { text: p, delay: Math.round(step * i++) }));
}
