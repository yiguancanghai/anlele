// 取正文第一行作为摘录（去掉 Markdown 引用符号）
export function firstLine(body = ''): string {
  const line = body.split('\n').find((l) => l.trim() !== '') ?? '';
  return line.replace(/^>\s*/, '').trim();
}

// 秒 → "3:12"
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
