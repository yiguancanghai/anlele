// 界面文字字典。组件里用 t('key') 取，不要把文字写死在组件里
export type Lang = 'zh' | 'en';

export const getLang = (locale?: string): Lang => (locale === 'en' ? 'en' : 'zh');

// 站内路径加上语言前缀：中文没有前缀，英文是 /en
export const localize = (path: string, lang: Lang) => (lang === 'en' ? `/en${path}` : path);

// 当前页在另一种语言里的地址（每件作品两种语言都会生成页面，所以一定存在）
export const switchPath = (path: string, to: Lang) => {
  const bare = path.replace(/^\/en(?=\/|$)/, '') || '/';
  return localize(bare, to);
};

export const htmlLang = (lang: Lang) => (lang === 'en' ? 'en' : 'zh-CN');

const zh = {
  'site.description': '诗、歌、短片，和我做的东西。',
  'nav.label': '主导航',
  'nav.words': '字',
  'nav.sounds': '声',
  'nav.frames': '影',
  'nav.build': '造',
  'nav.about': '我',
  'lang.label': '语言',
  'theme.toLight': '切换到浅色',
  'theme.toDark': '切换到深色',
  'home.order': '可以按任意顺序阅读',
  'home.shuffle': '换一种顺序',
  'home.now': '此刻',
  'words.sub': '诗、读书笔记、随笔',
  'words.filter': '按类型筛选',
  'words.all': '全部',
  'words.poems': '诗',
  'words.notes': '读书笔记',
  'words.essays': '随笔',
  'words.back': '← 字',
  'poem.toHorizontal': '横排',
  'poem.toVertical': '竖排',
  'poem.facing': '对照',
  'poem.rewrite': '重写一遍',
  'sounds.sub': '我写的歌，和 AI 一起完成。播放时可以继续去别处看看。',
  'sounds.description': '我写的歌，和 AI 一起完成。',
  'sounds.back': '← 声',
  'sounds.playThis': '播放',
  'sounds.lyrics': '歌词',
  'sounds.related': '为这首诗写的',
  'sounds.tools': '工具',
  'frames.sub': '短片',
  'frames.play': '播放',
  'build.sub': '我做的东西',
  'build.other': '其他',
  'build.visit': '访问',
  'build.screenshot': '截图',
  'about.description': '关于我',
  'player.label': '播放器',
  'player.play': '播放',
  'player.pause': '暂停',
  'player.next': '下一首',
  'player.seek': '播放进度',
  'only': '仅有英文', // 中文页面上，只有英文版的作品
  'rss.title': 'anlele · 字',
};

const en: Record<keyof typeof zh, string> = {
  'site.description': 'Poems, songs, short films, and things I make.',
  'nav.label': 'Main',
  'nav.words': 'Words',
  'nav.sounds': 'Sounds',
  'nav.frames': 'Frames',
  'nav.build': 'Build',
  'nav.about': 'About',
  'lang.label': 'Language',
  'theme.toLight': 'Switch to light',
  'theme.toDark': 'Switch to dark',
  'home.order': 'May be read in any order',
  'home.shuffle': 'Shuffle',
  'home.now': 'Now',
  'words.sub': 'Poems, reading notes, essays',
  'words.filter': 'Filter by kind',
  'words.all': 'All',
  'words.poems': 'Poems',
  'words.notes': 'Reading notes',
  'words.essays': 'Essays',
  'words.back': '← Words',
  'poem.toHorizontal': 'Horizontal',
  'poem.toVertical': 'Vertical',
  'poem.facing': 'Facing',
  'poem.rewrite': 'Rewrite',
  'sounds.sub': 'Songs I wrote, finished together with AI. Keep browsing while one plays.',
  'sounds.description': 'Songs I wrote, finished together with AI.',
  'sounds.back': '← Sounds',
  'sounds.playThis': 'Play',
  'sounds.lyrics': 'Lyrics',
  'sounds.related': 'Written for the poem',
  'sounds.tools': 'Made with',
  'frames.sub': 'Short films',
  'frames.play': 'Play',
  'build.sub': 'Things I have made',
  'build.other': 'Other',
  'build.visit': 'Visit',
  'build.screenshot': 'Screenshot',
  'about.description': 'About me',
  'player.label': 'Player',
  'player.play': 'Play',
  'player.pause': 'Pause',
  'player.next': 'Next',
  'player.seek': 'Progress',
  'only': 'In Chinese only', // 英文页面上，只有中文版的作品
  'rss.title': 'anlele · Words',
};

export const ui = { zh, en };
export type UIKey = keyof typeof zh;

export const useT = (lang: Lang) => (key: UIKey) => ui[lang][key];

// 作品类型的显示名（内容里的 kind 一律写中文）
const kindsEn: Record<string, string> = {
  诗: 'Poem',
  读书笔记: 'Reading note',
  随笔: 'Essay',
  歌: 'Song',
  短片: 'Short film',
  摄影: 'Photograph',
  App: 'App',
  项目: 'Project',
};
export const kindLabel = (kind: string, lang: Lang) => (lang === 'en' ? (kindsEn[kind] ?? kind) : kind);
