// 构建时把一首诗拆成"字"（英文按单词），并算好每个字开始浮现的时间（毫秒）
// 节奏：每字约 80ms；标点后多停 250ms；换行多停 500ms；空行（诗节之间）多停 900ms
// 整首写完控制在约 6–10 秒：长诗整体加快（每字最短 30ms），短诗略放慢

export interface Token {
  text: string;
  delay?: number; // 没有 delay 的是空格，原样输出、不做动画
}

export interface PoemLine {
  text: string; // 整行原文，给读屏器和复制用
  tokens: Token[];
}

export interface PoemLayout {
  stanzas: PoemLine[][];
  lineCount: number;
  total: number; // 最后一个字开始浮现的时间
}

const BASE = 80;
const PUNCT_PAUSE = 250;
const LINE_PAUSE = 500;
const STANZA_PAUSE = 900;
const MIN_BASE = 30;
const MIN_TOTAL = 6000;
const MAX_TOTAL = 10000;

const PUNCT = /^[，。、；：？！—…,.;:?!]$/u;
// 一个英文单词（含撇号、连字符）、一段空白、或者单个字符
const TOKEN = /[\p{Script=Latin}\p{N}'’-]+|\s+|./gu;

function split(body: string): string[][] {
  const stanzas: string[][] = [[]];
  for (const raw of body.replace(/\r/g, '').trim().split('\n')) {
    const line = raw.trim();
    if (line === '') {
      if (stanzas[stanzas.length - 1].length) stanzas.push([]);
    } else {
      stanzas[stanzas.length - 1].push(line);
    }
  }
  return stanzas.filter((s) => s.length);
}

// 按给定的间隔算一遍延迟，返回排好的诗和总时长
function time(stanzas: string[][], base: number, scale: number): PoemLayout {
  let t = 0;
  let lineCount = 0;
  let last = 0;
  const out = stanzas.map((lines, si) =>
    lines.map((text, li) => {
      lineCount++;
      const parts = text.match(TOKEN) ?? [];
      const tokens = parts.map((part, i) => {
        if (/^\s+$/.test(part)) return { text: part };
        const token = { text: part, delay: Math.round(t) };
        last = t;
        t += base;
        // 连续的标点（如"——"）只在最后一个后面停
        const next = parts.slice(i + 1).find((p) => !/^\s+$/.test(p));
        if (PUNCT.test(part) && !(next && PUNCT.test(next))) t += PUNCT_PAUSE * scale;
        return token;
      });
      const endOfStanza = li === lines.length - 1;
      if (!(endOfStanza && si === stanzas.length - 1)) t += (endOfStanza ? STANZA_PAUSE : LINE_PAUSE) * scale;
      return { text, tokens };
    }),
  );
  return { stanzas: out, lineCount, total: Math.round(last) };
}

export function layoutPoem(body: string): PoemLayout {
  const stanzas = split(body);
  const raw = time(stanzas, BASE, 1);
  if (raw.total === 0) return raw;
  // 把总时长拉进 6–10 秒；短诗最多放慢一倍
  const target = Math.min(MAX_TOTAL, Math.max(MIN_TOTAL, raw.total));
  const scale = Math.min(2, target / raw.total);
  return time(stanzas, Math.max(MIN_BASE, BASE * scale), scale);
}
