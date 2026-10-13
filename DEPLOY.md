# 部署 anlele.org

网站是纯静态的：推送到 GitHub 后，Cloudflare Pages 自动构建并发布。媒体文件（正式音频、封面）放 Cloudflare R2。

Cloudflare 后台的菜单名字偶尔会调整，下面写的是功能所在的位置，找不到时按功能名搜一下。

## 1. 推送到 GitHub

1. 打开 <https://github.com/new>，仓库名填 `anlele`，**不要**勾选添加 README / .gitignore / license（本地已经有了）。
2. 创建后，在项目文件夹里运行（把 `你的用户名` 换掉）：

   ```bash
   git remote add origin https://github.com/你的用户名/anlele.git
   git push -u origin main
   ```

以后每次 `git push`，网站都会自动重新发布。

## 2. Cloudflare Pages

1. Cloudflare 后台 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**，授权 GitHub 并选择 `anlele` 仓库。
2. 构建设置：

   | 项目 | 值 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

   Node 版本由仓库里的 `.nvmrc`（内容是 `22`）决定，不用另外设置。如果构建日志里显示的不是 Node 22，就在 **Settings → Environment variables** 里加 `NODE_VERSION` = `22`。
3. 点 **Save and Deploy**。完成后会得到一个 `xxx.pages.dev` 地址，先在这里确认网站正常。

## 3. 绑定域名

域名的 DNS 已经在 Cloudflare 上，所以很快。

1. Pages 项目 → **Custom domains** → **Set up a custom domain**，添加 `anlele.org`。
2. 同样再添加 `www.anlele.org`。
3. 让 www 跳转到根域：在 `anlele.org` 这个站点下 → **Rules** → **Redirect Rules** → 新建一条：
   - 条件：Hostname 等于 `www.anlele.org`
   - 动作：Dynamic redirect，表达式 `concat("https://anlele.org", http.request.uri.path)`，状态码 `301`，勾选保留查询参数

验证：打开 `https://www.anlele.org/words/`，应该跳到 `https://anlele.org/words/`。

## 4. R2 媒体存储

1. Cloudflare 后台 → **R2** → **Create bucket**，名字 `anlele-media`。
2. 进入存储桶 → **Settings** → **Custom Domains** → 添加 `media.anlele.org`。
3. 同一页的 **CORS Policy** → 编辑，粘贴：

   ```json
   [
     {
       "AllowedOrigins": ["https://anlele.org", "http://localhost:4321"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

4. 上传一首歌试试（比如 `chao-xi.mp3`），然后把 `src/content/sounds/chao-xi.md` 里的 `audio` 改成 `https://media.anlele.org/chao-xi.mp3`，`duration` 改成真实秒数。

`public/audio/` 里的几个 wav 只是占位，换成 R2 地址后可以删掉。

## 5. Cloudflare Web Analytics

Pages 项目 → **Metrics** → **Web Analytics** → **Enable**。Cloudflare 会在发布时自动插入统计脚本，不需要改代码。

## 上线后检查

- [ ] `https://anlele.org` 能打开，五个板块都能切换
- [ ] 用手机流量（不连 VPN）在大陆网络下能打开
- [ ] 在手机上播一首歌，锁屏后能看到歌名、能暂停和下一首
- [ ] `https://anlele.org/rss.xml` 和 `https://anlele.org/sitemap-index.xml` 能打开
- [ ] `https://www.anlele.org` 会跳到根域
