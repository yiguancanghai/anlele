# anlele.org

我的作品集网站。改完内容后推送到 GitHub，Cloudflare 会自动发布，一两分钟后线上就更新了。

最省事的做法：把下面对应的那一节和你的内容一起发给 AI，让它照着改。

## 本地预览

```bash
npm install
npm run dev
```

打开 <http://localhost:4321>。

## 发布

```bash
git add -A
git commit -m "说明改了什么"
git push
```

推送时要求输入密码的话，填 GitHub 令牌（不是登录密码），生成方法见 `DEPLOY.md`。

---

## 新增一首诗

在 `src/content/words/` 里新建一个文件，文件名用英文或拼音，比如 `ye-hang.md`，它会成为网址：`anlele.org/words/ye-hang/`。

```md
---
title: 夜航
date: 2026-09-20
kind: 诗
---

灯塔把一句话
说了整整一夜

海没有回答
只是把船
轻轻推回岸边
```

- 每一行就是诗的一行，空一行就是分节。
- 读书笔记把 `kind` 写成 `读书笔记`，再加 `book:` 和 `author:` 两行。正文里用 `>` 开头写摘录，紧跟的下一段是批注。
- 随笔把 `kind` 写成 `随笔`，正常写段落即可。
- 想先藏起来不发布，加一行 `draft: true`。

## 新增一首歌

1. 把 mp3 上传到 Cloudflare R2 的 `anlele-media` 存储桶，文件名用英文，比如 `ye-ben.mp3`。上传后地址是 `https://media.anlele.org/ye-ben.mp3`。
2. 在 `src/content/sounds/` 新建 `ye-ben.md`：

```md
---
title: 夜奔
date: 2026-10-01
audio: https://media.anlele.org/ye-ben.mp3
duration: 213
note: 一行说明，显示在歌名下面
tools: [Suno]
---

这里可以放歌词和创作说明。
```

- `duration` 是秒数（3 分 33 秒 = 213）。
- 如果这首歌是为某首诗写的，加一行 `related: 诗的文件名`（不带 `.md`）。

## 新增一部短片

1. 先把视频传到 B站，记下视频号（网址里 `BV` 开头的那串）。
2. 在 `src/content/frames/` 新建一个文件：

```md
---
title: 短片名
date: 2026-04-12
kind: 短片
bvid: BV1xx411c7mD
duration: "3:20"
cover: https://media.anlele.org/cover-xxx.jpg
---

一段简介。
```

- `cover` 可以不写，不写就显示深色底和播放图标。

## 改"此刻"

直接改 `src/content/now.md`，一行一件事，行与行之间空一行。

## 其他常改的地方

| 想改什么 | 改哪个文件 |
|---|---|
| 首页门口的那句诗 | `src/data/site.ts` 里的 `epigraph` |
| "我"页面的两段话、联系方式 | `src/data/site.ts` 里的 `about`、`contacts` |
| Mirror AI 的介绍、链接、功能点 | `src/content/build/mirror-ai.md` |
| 新增一个项目 | 在 `src/content/build/` 新建文件，照 `anlele-org.md` 写 |
| 颜色 | `src/styles/tokens.css` |

字段写错（比如 `kind` 拼错、漏了 `title`）时，`npm run build` 会报错并指出是哪个文件，Cloudflare 也不会发布出错的版本，线上保持原样。
