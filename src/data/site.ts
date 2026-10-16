// 站点配置：门口那句诗、"我"页面的文字和联系方式（中英各一份）
import type { Lang } from '../i18n/ui';

// 首页门口的一句诗
export const epigraph: Record<Lang, { lines: string[]; source: string }> = {
  zh: { lines: ['灯塔把一句话', '说了整整一夜'], source: '夜航' },
  en: { lines: ['The lighthouse said one sentence', 'all night long'], source: 'Night Voyage' },
};

// "我"页面的两段话（示例，请替换）
export const about: Record<Lang, string[]> = {
  zh: [
    '（示例）我写诗，也写歌，偶尔拍一点短片。白天做一个叫 Mirror AI 的应用。',
    '（示例）这里收着一些傍晚才想得起来的东西。可以按任意顺序看。',
  ],
  en: [
    '(Example) I write poems and songs, and now and then make a short film. By day I build an app called Mirror AI.',
    '(Example) This is where I keep the things I only remember at dusk. Read them in any order.',
  ],
};

// 联系方式（示例，请替换）
export const contacts: { label: Record<Lang, string>; href: string }[] = [
  { label: { zh: '邮箱（示例）', en: 'Email (example)' }, href: 'mailto:hello@anlele.org' },
  { label: { zh: 'B站（示例）', en: 'Bilibili (example)' }, href: 'https://space.bilibili.com/' },
  { label: { zh: 'GitHub（示例）', en: 'GitHub (example)' }, href: 'https://github.com/' },
];
