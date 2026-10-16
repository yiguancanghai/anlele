// Base.astro 内联脚本挂在 window 上的主题设置函数
interface Window {
  anleleSetTheme?: (theme: 'light' | 'dark') => void;
}
