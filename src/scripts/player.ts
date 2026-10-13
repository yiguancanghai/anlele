// 全局播放器的状态。整个站只加载一次，切换页面时不会重置，所以音乐不断
//
// 通信方式：
//   页面上任何带 data-track-id 的按钮被点击 → 发出 player:toggle 事件（detail 是歌的 id）
//   播放器状态变化 → 发出 player:change 事件 → 更新播放器界面，并高亮页面上对应的那一行
import { formatTime } from './text';

interface Track {
  id: string;
  title: string;
  audio: string;
  duration: number;
  cover?: string;
}

// 音频对象不放在页面里，页面怎么换都不影响它
const audio = new Audio();
const tracks: Track[] = JSON.parse(document.getElementById('player')?.dataset.tracks ?? '[]');
let current: Track | undefined;

const one = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
const changed = () => document.dispatchEvent(new CustomEvent('player:change'));

function start(track: Track) {
  current = track;
  audio.src = track.audio;
  audio.play().catch(() => {});
  // 锁屏 / 耳机线控上显示歌名
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'anlele',
      artwork: track.cover ? [{ src: track.cover }] : [],
    });
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

// 播放器界面 + 页面上各行的高亮
function render() {
  const el = one('#player');
  if (!el || !current) return;
  const playing = !audio.paused;
  el.hidden = false; // 第一次点歌之后才出现
  el.dataset.playing = String(playing);
  one('[data-player-toggle]')?.setAttribute('aria-label', playing ? '暂停' : '播放');
  const title = one('[data-player-title]');
  if (title) title.textContent = current.title;
  renderTime();
  document.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row) => {
    row.setAttribute('aria-pressed', String(playing && row.dataset.trackId === current?.id));
  });
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
