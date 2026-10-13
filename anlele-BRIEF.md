# anlele.org 建站说明（给 Claude Code）

请在当前空文件夹里，从零搭建我的个人文艺作品集网站 anlele.org。先通读整份说明，列出计划，然后按"工作方式"一节分阶段做，每个阶段做完让我在浏览器里看一眼再继续。

---

## 1. 这是什么网站

一个极简、克制的个人作品集，收录我的：诗、读书笔记、随笔；我用 AI 创作的音乐；短片；我做的 App（Mirror AI，一个帮助心智成长的 AI 应用）和其他项目。

**设计核心概念：黄昏。** 灵感来自萨福写黄昏星的残篇（傍晚的星把白天散开的一切带回家）、安娜·卡森的克制，以及尤瑟纳尔的"小欢愉"式生活：具体、亲密、细小、此刻。整个网站像一页诗，大量留白，几乎没有装饰，动效极少且缓慢。

**禁止**：方括号作为装饰元素、卡片阴影、渐变、emoji、圆角大卡片、花哨动效、等宽字体、亮色主题。

---

## 2. 技术栈

- **Astro 5**（最新稳定版），纯静态输出（`output: 'static'`）
- **样式**：原生 CSS + CSS 变量，用 Astro 组件内的 scoped style，不用 Tailwind
- **页面切换**：Astro 的 `<ClientRouter />`（View Transitions）
- **内容**：Astro Content Collections，每件作品一个 Markdown 文件，用 `src/content.config.ts` + zod 定义字段
- **不用 React/Vue**，交互用少量原生 TypeScript
- **字体自托管**：`@fontsource/noto-serif-sc`（300、400）和 `@fontsource/cormorant-garamond`（400、500，含 italic）。Fontsource 已按 unicode-range 切片，浏览器只下载用到的字
- **其他**：`@astrojs/sitemap`，`@astrojs/rss`（为"字"生成 RSS）
- **部署**：Cloudflare Pages（GitHub 自动构建），媒体文件放 Cloudflare R2

**大陆访问约束（重要）**：网站不备案，部署在海外，要保证大陆能打开。所以**不能引用任何 Google 资源**（Google Fonts、Analytics、YouTube 等）以及其他在大陆被屏蔽的第三方脚本。所有字体、脚本必须自托管。视频统一用 B站嵌入。统计以后用 Cloudflare Web Analytics。

---

## 3. 视觉规范

### 颜色（只有这些）

```css
--bg:   #0C0A08;  /* 近黑，夜 */
--ink:  #E9E0D1;  /* 暖米白，正文 */
--mute: #8F8577;  /* 次要文字、说明 */
--line: #262019;  /* 分隔线 */
--acc:  #DD6E2E;  /* 陶土橙，落日与黄昏星 */
```

橙色用得很省：只给"被看见的东西"——当前所在板块的导航、悬停的标题、正在播放的歌、落日那颗圆、少量标签字（如"此刻""注"）。

### 字体

- 中文：Noto Serif SC，正文 weight 300，标题 400，**不用粗体**
- 西文、罗马数字编号、年份、logo "anlele"：Cormorant Garamond **italic**
- 不用任何无衬线体和等宽体

### 排版

- 内容容器最大宽度约 1080px，左右内边距 28px；文字栏更窄：正文 560–720px
- 行高宽松：正文 2.0–2.1，诗歌 2.3–2.4
- 板块标题很小（15px、橙色），不做大标题。克制靠留白而不是字号
- 上下留白大：板块顶部约 120px
- 作品编号用小写罗马数字 i, ii, iii…
- 分隔只用 1px 的 `--line` 细线

### 动效（只有这几种）

- 文字缓慢浮现：opacity 0→1 + 上移 6px，1.4s ease，可错开 0.25s
- 首页落日：橙色小圆用约 9 秒从上方缓缓沉到地平线
- 悬停：颜色过渡 0.4–0.5s
- 页面切换：View Transitions 默认淡入淡出
- 必须尊重 `prefers-reduced-motion`：开启时关闭所有动画，直接显示终态

### 无障碍

- 所有可点击元素是真正的 `<a>` 或 `<button>`，点击区域 ≥ 44px
- 只有图标的按钮要有 `aria-label`
- 焦点样式：1px 橙色 outline，offset 6px
- `<html lang="zh-CN">`

---

## 4. 网站结构

| 路径 | 中文导航 | 内容 |
|---|---|---|
| `/` | — | 首页 |
| `/words/` | 字 | 诗、读书笔记、随笔，可筛选 |
| `/words/[slug]/` | — | 单篇 |
| `/sounds/` | 声 | 音乐列表 |
| `/frames/` | 影 | 短片（以后加摄影） |
| `/build/` | 造 | Mirror AI 重点介绍 + 其他项目 |
| `/about/` | 我 | 关于我 |

**页眉**：左边 logo `anlele`（Cormorant italic，24px，链接首页）；右边导航只显示中文单字：字 声 影 造 我（每个带英文 `aria-label`：Words / Sounds / Frames / Build / About）。当前板块的字为橙色。

**页脚**：左边按访客本地时间显示问候，如"10月13日，傍晚好。"（客户端 JS 计算；0–5 深夜好，5–11 早上好，11–17 午后好，17–20 傍晚好，20–24 晚上好），右边 `anlele.org`（Cormorant italic）。

---

## 5. 各页面细节

### 首页 `/`

从上到下：

1. **落日**：一条贯穿内容宽度的 1px 地平线；地平线上方偏右（约 18% 右边距）一颗 16px 的橙色圆，进入页面时用 9 秒缓缓沉到地平线上
2. **门口的一句诗**：地平线下方，30px、weight 300、字间距 0.06em，下面一行小字署名"— 《诗名》"。内容来自 `src/data/site.ts` 里的 `epigraph` 配置
3. **此刻**：橙色 Cormorant italic 小标签"此刻"，下面一两行小字：在读什么、在听什么、今天的一件小事。内容来自 `src/content/now.md`，方便我经常改
4. **作品目录**：顶部一行小字"可以按任意顺序阅读"，右侧一个文字按钮"换一种顺序"。下面是**所有板块混合**的作品列表，每行：罗马数字编号 / 标题 + 类型小字（诗、歌、短片、读书笔记、App…）/ 年份。**每次打开页面顺序都随机**（服务端按日期输出，客户端加载后洗牌并重新编号；点按钮再洗一次）。点"歌"直接开始播放，其他跳到对应页面

### 字 `/words/`

- 小标题"字"，副标题"诗、读书笔记、随笔"
- 筛选：全部 / 诗 / 读书笔记 / 随笔（纯文字按钮，当前项橙色；用 URL 参数或客户端过滤都可以）
- 列表：编号 / 标题 + 首句摘录 / 类型

### 单篇 `/words/[slug]/`

按 `kind` 用不同版式：

- **诗**：居中，标题字间距 0.2em，下面年份。正文**默认竖排**（`writing-mode: vertical-rl`，高约 420px，字间距 0.26em，行高 2.3），右上角文字按钮可切换横排/竖排，选择记在 localStorage（读写都要 try/catch）。**手机宽度下默认横排**。诗的每一行在 Markdown 里就是一行，保留换行。结尾一个橙色小圆点
- **读书笔记**：frontmatter 里有书名、作者；正文由多组"摘录 + 批注"组成。摘录 19px 米白色；批注前面一个橙色 Cormorant italic 的"注"字，批注本身 15px `--mute` 色。用 Markdown 的引用块 `>` 表示摘录、紧跟的段落表示批注，用 CSS 实现上述样式即可
- **随笔**：普通文章版式，窄栏 600px
- 左上角"← 字"返回

### 声 `/sounds/`

- 小标题"声"，副标题"我写的歌，和 AI 一起完成。播放时可以继续去别处看看。"
- 列表每行：左侧一个 6px 橙色小圆点（只在悬停或正在播放时显示）/ 歌名 + 一行说明 / 时长（Cormorant italic）
- 点击一行开始播放；再点正在播放的那行则暂停
- 可以有单曲详情页显示歌词和创作说明（第二阶段再做，先留数据字段）

### 全局播放器（重点）

- 放在全局 layout 里，使用 `transition:persist`，**切换页面时音乐不断**
- 用户第一次点歌之前**不显示**
- 固定在页面底部（sticky/fixed），背景 `--bg`，顶部一条 1px 进度条：底色 `--line`，已播放部分 `--acc`
- 一行内容：播放/暂停按钮（橙色细线图标）/ 歌名 / `0:42 / 3:12`（Cormorant italic）/ 文字按钮"下一首"
- 播完自动下一首；点击进度条可以跳转
- 用一个小的 TypeScript 模块管理状态，列表页的按钮通过 `data-track-id` + 自定义事件和播放器通信；播放器状态变化时，页面上对应那一行要高亮（页面切换后也要正确同步）
- 加 Media Session API（锁屏/耳机控制显示歌名）

### 影 `/frames/`

- 小标题"影"，副标题"短片"
- 每部短片纵向排列，间距很大（约 96px）：16:9 的画面区域、标题 + 时长年份、一段简介
- **B站嵌入**：默认只显示封面图（或深色底 + 橙色细线播放图标），点击后才替换成 iframe：`https://player.bilibili.com/player.html?bvid=BVxxx&autoplay=1&high_quality=1`，iframe 要 `allowfullscreen`。这样不拖慢页面
- 预留以后加"摄影"分栏的结构

### 造 `/build/`

- 小标题"造"，副标题"我做的东西"
- **Mirror AI 重点区**：左边一个手机比例（9:19）的截图框（细线描边、圆角 32px），右边：名字"Mirror AI"（Cormorant italic 44px）、一句话介绍、一段"为什么做它"、三个功能点（罗马数字编号 + 细线分隔）、一个橙色链接（访问/下载）。手机宽度下上下堆叠
- 下方"其他"：其他项目列表，同首页目录样式

### 我 `/about/`

- 小标题"我"，两段话（一段米白、一段 `--mute`），下面几个联系方式文字链接

---

## 6. 内容模型（src/content.config.ts）

用 `glob` loader，每个集合一个文件夹。字段用 zod 校验，写错时构建要报错。

```ts
words:  title, date, kind: '诗' | '读书笔记' | '随笔', excerpt?(可选，没有就取正文首行),
        book?, author?(读书笔记用), draft?: boolean
sounds: title, date, audio(URL), duration(秒), note(一行说明), cover?(图片),
        tools?: string[], related?(关联的诗 slug), draft?
frames: title, date, kind: '短片' | '摄影', bvid?, duration?(如 "3:20"), cover?, draft?
build:  title, date, tagline, url?, featured?: boolean, features?: string[],
        screenshot?, stack?, draft?
```

`draft: true` 的不显示。另外 `src/content/now.md`（首页"此刻"）和 `src/data/site.ts`（门口那句诗、联系方式、Mirror AI 链接等站点配置）。

**请放入示例内容**，让每个页面都有东西可看（所有示例都在标题或说明里注明"示例"，方便我替换）：

- 诗《夜航》：灯塔把一句话 / 说了整整一夜 / 海没有回答 / 只是把船 / 轻轻推回岸边
- 诗《潮汐》：月亮每天来取走一点什么 / 我数了数 / 剩下的 / 刚好够写一首诗
- 一篇读书笔记（两组摘录+批注，用占位文字）、一篇随笔（占位）
- 三首歌：潮汐、黄昏星、雾中。音频先用 `public/audio/` 下用脚本生成的几秒钟静音或简单正弦波 mp3/wav 占位，正式音频以后放 R2
- 两部短片（bvid 用占位）
- Mirror AI（featured）和 anlele.org 本身两个项目
- 门口那句诗默认用《夜航》的前两行

---

## 7. 项目结构（参考）

```
src/
  content/  words/ sounds/ frames/ build/ now.md
  content.config.ts
  data/site.ts
  components/
    Header.astro  Footer.astro  Player.astro  Sunset.astro
    WorkIndex.astro  PoemReader.astro  BiliEmbed.astro  TrackRow.astro
  layouts/Base.astro          ← ClientRouter、Header、Player(persist)、Footer
  pages/ index.astro  words/index.astro  words/[...slug].astro
         sounds.astro  frames.astro  build.astro  about.astro  rss.xml.ts
  scripts/player.ts           ← 播放器状态
  styles/tokens.css  global.css
public/ fonts? audio/ favicon.svg（一颗橙色小圆即可）
```

---

## 8. 质量要求

- 手机宽度（375px）下完全可用：导航不换行错乱、Mirror AI 区上下堆叠、诗默认横排、无横向滚动
- 每页有正确的 `<title>`、description、Open Graph 信息
- Lighthouse 性能和无障碍尽量 ≥ 95
- `npm run build` 零报错零警告
- 代码有简短的中文注释，方便我以后让 AI 修改

---

## 9. 工作方式

分阶段做，每个阶段结束运行 `npm run dev` 并告诉我看哪里：

1. **骨架**：初始化项目、依赖、字体、颜色变量、Base 布局、页眉页脚、六个空页面，导航可以切换
2. **内容**：Content Collections + 全部示例内容 + 字/影/造/我 四个板块
3. **首页**：落日、门口的诗、此刻、可洗牌的作品目录
4. **播放器**：跨页播放、与列表同步、Media Session
5. **打磨**：动效、手机适配、reduced-motion、SEO、RSS、sitemap
6. **部署**：初始化 git，写一份 `DEPLOY.md`，然后带我一步步完成：
   - 在 GitHub 新建仓库 `anlele` 并推送
   - Cloudflare Pages 连接仓库（构建命令 `npm run build`，输出 `dist`，Node 22），绑定自定义域名 `anlele.org` 和 `www.anlele.org`（www 跳转到根域）。域名的 DNS 已经在 Cloudflare 上了
   - 建 R2 存储桶 `anlele-media`，绑定 `media.anlele.org`，配置 CORS 允许 `https://anlele.org` 和 `http://localhost:4321` 的 GET 请求
   - 打开 Cloudflare Web Analytics
7. 最后写一份 `README.md`：**以后怎么新增一首诗 / 一首歌 / 一部短片 / 改"此刻"**，越简单越好，我主要会让 AI 帮我改

遇到需要我做决定的地方（比如某个交互拿不准）先问我，不要自己发挥加功能。保持克制，宁可少，不要多。
