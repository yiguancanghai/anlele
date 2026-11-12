// Base.astro 内联脚本挂在 window 上的主题设置函数
interface Window {
  anleleSetTheme?: (theme: 'light' | 'dark') => void;
  // 全局播放器的当前状态（src/scripts/player.ts）
  anlelePlayer?: { readonly id?: string; readonly time: number; readonly playing: boolean };
}
