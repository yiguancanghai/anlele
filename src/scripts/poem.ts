// 构建时整理一首诗：按空行分节、每行去掉首尾空白

export interface PoemLayout {
  stanzas: string[][]; // 每节若干行
  lineCount: number;
}

export function splitPoem(body: string): PoemLayout {
  const stanzas: string[][] = [[]];
  for (const raw of body.replace(/\r/g, '').trim().split('\n')) {
    const line = raw.trim();
    if (line === '') {
      if (stanzas[stanzas.length - 1].length) stanzas.push([]);
    } else {
      stanzas[stanzas.length - 1].push(line);
    }
  }
  const out = stanzas.filter((s) => s.length);
  return { stanzas: out, lineCount: out.reduce((n, s) => n + s.length, 0) };
}

// 把一行拆成"字"（英文按单词），空白单独成段。单曲页歌词的当前句逐字出现用它
const TOKEN = /[\p{Script=Latin}\p{N}'’-]+|\s+|./gu;
export const tokenize = (text: string): string[] => text.match(TOKEN) ?? [];
