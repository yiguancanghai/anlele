// 全局播放器的状态。整个站只加载一次，切换页面时不会重置，所以音乐不断
//
// 通信方式：
//   页面上任何带 data-track-id 的按钮被点击 → 发出 player:toggle 事件（detail 是歌的 id）
//   页面要跳到某首歌的某一秒 → 发出 player:seek 事件（detail: { id, t }）
//   播放器状态变化 → 发出 player:change 事件 → 更新播放器界面，并高亮页面上对应的那一行
//   当前歌词句变化 → 发出 player:lyric 事件（detail: { id, index, playing }），单曲页据此高亮
//   页面发出 player:ask → 播放器马上再发一次 player:lyric
import { formatTime } from './text';
import { ui, type Lang } from '../i18n/ui';
import type { LyricLine } from './lyrics';

interface Track {
  id: string;
  title: Record<Lang, string>;
  audio: string;
  duration: number;
  cover?: string;
  lyrics?: Partial<Record<Lang, LyricLine[]>>;
}

export interface LyricState {
  id?: string;
  index: number; // 当前句的序号，-1 表示还没到第一句
  playing: boolean;
}

// 音频对象不放在页面里，页面怎么换都不影响它
const audio = new Audio();
const tracks: Track[] = JSON.parse(document.getElementById('player')?.dataset.tracks ?? '[]');
let current: Track | undefined;
let lineIndex = -1;
let raf = 0;

const one = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
// 当前页面的语言（切换语言后播放器不会重新渲染，所以每次都现读）
const lang = (): Lang => (document.documentElement.lang === 'en' ? 'en' : 'zh');
const changed = () => document.dispatchEvent(new CustomEvent('player:change'));

function start(track: Track) {
  current = track;
  lineIndex = -1;
  audio.src = track.audio;
  audio.play().catch(() => {});
  // 锁屏 / 耳机线控上显示歌名
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title[lang()],
      artist: 'anlele',
      artwork: track.cover ? [{ src: track.cover }] : [],
    });
  }
}

// 跳到某首歌的某一秒并播放（单曲页点击某句歌词）
function seekTo(id: string, t: number) {
  const track = tracks.find((tr) => tr.id === id);
  if (!track) return;
  if (track !== current) {
    start(track);
    audio.addEventListener('loadedmetadata', () => (audio.currentTime = t), { once: true });
  } else {
    audio.currentTime = t;
    if (audio.paused) audio.play().catch(() => {});
  }
}

// 点同一首：播放 / 暂停；点另一首：换歌
function toggle(id?: string) {
  const track = tracks.find((t) => t.id === id) ?? current;
  if (!track) return;
  if (track !== current) start(track);
  else if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function next() {
  if (!current) return;
  start(tracks[(tracks.indexOf(current) + 1) % tracks.length]);
}

// 总时长：音频加载出来之前先用内容里写的 duration
const total = () => (Number.isFinite(audio.duration) ? audio.duration : (current?.duration ?? 0));

// 进度条和时间（播放中每秒更新几次）
function renderTime() {
  const time = one('[data-player-time]');
  const fill = one('[data-player-fill]');
  const seek = one<HTMLInputElement>('[data-player-seek]');
  const ratio = total() ? audio.currentTime / total() : 0;
  if (time) time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(total())}`;
  if (fill) fill.style.width = `${ratio * 100}%`;
  if (seek) seek.value = String(Math.round(ratio * 1000));
}

// ---------- 歌词 ----------
// 当前页面语言的歌词，没有就用另一种
const lyricsOf = (track?: Track) => track?.lyrics?.[lang()] ?? track?.lyrics?.zh ?? track?.lyrics?.en;

// 二分查找：最后一句开始时间 ≤ time 的序号
function findLine(lines: LyricLine[], time: number) {
  let lo = 0;
  let hi = lines.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].t <= time) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// 底部播放器里的当前这句：换句时旧的淡出、新的淡入
function renderLyric(animate: boolean) {
  const el = one('[data-player-lyric]');
  if (!el) return;
  const lines = lyricsOf(current);
  el.hidden = !lines;
  const text = lines?.[lineIndex]?.text ?? '';
  if (el.textContent === text) return;
  if (!animate || reduced()) {
    el.textContent = text;
    return;
  }
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease' }).onfinish = () => {
    el.textContent = text;
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease' });
  };
}

function emitLyric() {
  const detail: LyricState = { id: current?.id, index: lineIndex, playing: !audio.paused };
  document.dispatchEvent(new CustomEvent('player:lyric', { detail }));
}

// 播放时每一帧读一次当前时间（timeupdate 太粗），句子变了才通知
function tick() {
  const lines = lyricsOf(current);
  if (lines) {
    const i = findLine(lines, audio.currentTime);
    if (i !== lineIndex) {
      lineIndex = i;
      renderLyric(true);
      emitLyric();
    }
  }
  raf = requestAnimationFrame(tick);
}

audio.addEventListener('play', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
});
audio.addEventListener('pause', () => cancelAnimationFrame(raf));

// 播放器界面 + 页面上各行的高亮
function render() {
  const el = one('#player');
  if (!el) return;
  const t = ui[lang()];
  el.setAttribute('aria-label', t['player.label']);
  one('[data-player-seek]')?.setAttribute('aria-label', t['player.seek']);
  const nextBtn = one('[data-player-next]');
  if (nextBtn) nextBtn.textContent = t['player.next'];
  if (!current) return;
  const playing = !audio.paused;
  el.hidden = false; // 第一次点歌之后才出现
  el.dataset.playing = String(playing);
  one('[data-player-toggle]')?.setAttribute('aria-label', playing ? t['player.pause'] : t['player.play']);
  const title = one('[data-player-title]');
  if (title) title.textContent = current.title[lang()];
  renderTime();
  document.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row) => {
    row.setAttribute('aria-pressed', String(playing && row.dataset.trackId === current?.id));
  });
  renderLyric(false);
  emitLyric();
}

document.addEventListener('click', (e) => {
  const target = e.target as Element;
  const row = target.closest<HTMLElement>('[data-track-id]');
  if (row) document.dispatchEvent(new CustomEvent('player:toggle', { detail: row.dataset.trackId }));
  else if (target.closest('[data-player-toggle]')) document.dispatchEvent(new CustomEvent('player:toggle'));
  else if (target.closest('[data-player-next]')) next();
});

// 拖动 / 点击进度条跳转
document.addEventListener('input', (e) => {
  const seek = (e.target as Element).closest<HTMLInputElement>('[data-player-seek]');
  if (seek && total()) audio.currentTime = (Number(seek.value) / 1000) * total();
});

document.addEventListener('player:toggle', (e) => toggle((e as CustomEvent<string | undefined>).detail));
// 页面（比如刚打开的单曲页）可以主动要一次当前歌词状态
document.addEventListener('player:ask', emitLyric);
document.addEventListener('player:seek', (e) => {
  const { id, t } = (e as CustomEvent<{ id: string; t: number }>).detail;
  seekTo(id, t);
});
document.addEventListener('player:change', render);
document.addEventListener('astro:page-load', render); // 换页后，新页面上的行也要同步高亮

audio.addEventListener('play', changed);
audio.addEventListener('pause', changed);
audio.addEventListener('loadedmetadata', renderTime);
audio.addEventListener('timeupdate', renderTime);
audio.addEventListener('ended', next); // 播完自动下一首

if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => toggle());
  navigator.mediaSession.setActionHandler('pause', () => toggle());
  navigator.mediaSession.setActionHandler('nexttrack', next);
}
