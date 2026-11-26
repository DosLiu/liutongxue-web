# 维护指南

日常启动、环境配置和检查命令见[项目 README](../README.md)。这份文档记录页面改动与发布时需要同步的文件。

## 常用修改入口

| 内容 | 文件 |
| --- | --- |
| 首页标题、首屏布局 | [HomePage.tsx](../src/pages/HomePage.tsx)、[index.css](../src/index.css) |
| 首屏星空动效 | [AntigravityStarfield.tsx](../src/components/AntigravityStarfield.tsx) |
| 首页项目卡片 | [toolsShowcase.ts](../src/constants/toolsShowcase.ts) |
| 数智灵言和数智履痕 | [testimonials.ts](../src/constants/testimonials.ts)、[FeatureCardsSection.tsx](../src/components/FeatureCardsSection.tsx) |
| 联系区和二维码 | [StartBuildingSection.tsx](../src/components/StartBuildingSection.tsx)、[联系区图片](../src/assets/contact/) |
| 案发现场项目卡片 | [sceneProjects.ts](../src/constants/sceneProjects.ts) |
| 导航、页脚和品牌标识 | [site.ts](../src/site.ts)、[SiteHeader.tsx](../src/components/SiteHeader.tsx)、[SiteFooter.tsx](../src/components/SiteFooter.tsx)、[ReactBitsLogo.tsx](../src/components/ReactBitsLogo.tsx) |

「与我链接」使用首页的 `#contact` 锚点，入口在 `site.ts`。昵称、文案和图片变更可沿上述入口定位。

## 角色对话

七个对话页共用[聊天启动入口](../src/figure-chat.tsx)和[聊天页面组件](../src/features/figure-chat/FigureChatPage.tsx)。每个 HTML 页的 `body[data-figure-id]` 选择对应角色。[前端角色配置](../src/features/figure-chat/shared.ts)维护展示名、简介、助手标签和演示配置。[共享角色实现](../api/_lib/figure-chat.js)维护模型提示词、直出规则和演示回复，前后端都引用它。

### 新增角色

1. 确定角色 ID，在 [site.ts](../src/site.ts) 增加 `withBaseUrl('/figures/<角色 ID>/')` 路径。站内链接沿用这个路径，便于在 GitHub Pages 的子路径下构建。
2. 以[现有角色页](../figures/steve-jobs/index.html)为模板，建立 `figures/<角色 ID>/index.html`。将 `data-figure-id` 设为角色 ID，模块入口指向 `/src/figure-chat.tsx`。Vite 会自动收集该 HTML。
3. 在[角色列表页](../src/pages/FiguresPage.tsx)添加卡片，再在[前端角色配置](../src/features/figure-chat/shared.ts)补齐 `title`、`description`、`assistantLabel`、`panelAriaLabel`、`storageKey`、`freeLimit` 和演示回复。使用头像时，素材放在 `src/assets/figures/`。
4. 在[共享角色实现](../api/_lib/figure-chat.js)登记角色 ID、模型配置和回复逻辑，同步[类型声明](../api/_lib/figure-chat.d.ts)中的 `FigureChatId`。`freeLimit` 控制本地演示口径，真实对话额度由服务端校验。
5. 在 [SEO 配置](../src/seo/criticalPageContent.ts)的角色定义中登记新页，在 [sitemap.xml](../public/sitemap.xml)补上正式网址。
6. 运行 `npm run check`。打开新角色页核对标题、演示回复和发送请求中的 `figureId`。

### 接口与访客额度

[前端接口解析](../src/features/figure-chat/runtime.ts)默认使用同域 `/api/chat`。分域部署时用 `VITE_JOBS_CHAT_API_BASE_URL` 指定 API 基地址，或用优先级更高的 `VITE_CHAT_API_URL` 指定完整请求地址。在服务端的 `ALLOWED_ORIGINS` 加入实际使用的前端来源，部署后确认浏览器能保存并发送游客 Cookie。

[聊天接口](../api/chat.ts)在真实模型调用前预留额度。访客由签名的 HttpOnly Cookie 识别，所有角色共享每日 5 次体验，北京时间 0 点重置。页面根据接口返回的 `quota` 更新显示，模型失败时服务端会尝试释放预留。额度用完会返回 HTTP 429，配置或 Redis 校验失败会暂停真实模型调用并显示对应提示。

登录默认关闭。恢复后端登录时，按 [环境变量模板](../.env.example) 配置大恩聚合服务，再设置 `AUTH_LOGIN_ENABLED=true`。正式回调路径为 `/api/auth/callback`。[认证实现](../api/_lib/auth.js)负责签名和回调，[认证入口](../api/auth/)处理登录、回调、退出和状态，[api/daen.ts](../api/daen.ts)兼容旧分发路径。[账号额度](../api/_lib/quota.js)由 `AUTH_DAILY_LIMIT` 控制，默认每日 10 次。

### 数字分身资料

[资料加载模块](../api/_lib/digital-human-skill.js)使用 `DIGITAL_HUMAN_GITHUB_TOKEN` 读取私有仓库 `DosLiu/liudongsheng-skill` 的 `main` 分支。同一次刷新固定使用同一个 Git 提交，读取 `SKILL.md`、`references/profile.md` 和 `references/evidence.md`。

每个服务实例在收到请求时约每 5 分钟检查一次更新。临时故障时，同一实例可使用至多 24 小时内上次验证成功的版本。权限失效时暂停使用缓存，实例重启后重新拉取资料。实际对话会把这些资料交给配置的模型服务，发布资料前应确认适合用于对外对话。页面显示「资料已连接」后，可发送一条消息核对真实模型回复。

## 工作日志

[日志路由](../src/data/scene/routes.ts)中的 `SCENE_LOGS_UNDER_MAINTENANCE` 控制所有工作日志入口。当前设为 `true`。正式站和 GitHub Pages 为汇总、团队列表和详情页生成「AI 工作日志正在整理」页面，[站点地图](../public/sitemap.xml)继续列出原网址。资料整理完成后设为 `false` 并重新部署，项目卡片和原网址会恢复访问。

| 团队 | 路径 | 列表数据 | 详情正文 |
| --- | --- | --- | --- |
| 数字居民 | `/scene/digital-resident/` | [digital-resident.ts](../src/data/scene/digital-resident.ts) | [digital-resident.detail.ts](../src/data/scene/digital-resident.detail.ts) |
| 博客运营 | `/scene/blog-ops/` | [blog-ops.ts](../src/data/scene/blog-ops.ts) | [blog-ops.detail.ts](../src/data/scene/blog-ops.detail.ts) |
| 站点运维 | `/scene/site-ops/` | [site-ops.ts](../src/data/scene/site-ops.ts) | [site-ops.detail.ts](../src/data/scene/site-ops.detail.ts) |

### 给已有团队加一条日志

1. 在该团队的列表 `logs` 中添加条目，填写 `id`、`publishedAt`、`title`、`preview`、`summary`、`seoTitle` 和 `seoDescription`。如详情页需要不同标题，可填 `detailTitle`。
2. 在对应的 `*.detail.ts` 中以相同的日期补上 `detailContent` 段落数组。按需填写 `detailImageAlt`、`detailImageCaption`、`sourceHref` 和 `sourceLabel`。
3. 按[现有详情入口](../scene/blog-ops/2026-04-01/index.html)新建 `scene/<团队>/<YYYY-MM-DD>/index.html`，共用 [sceneLogDetail.tsx](../src/sceneLogDetail.tsx)。
4. 封面放到 `src/assets/scene/<团队>/<YYYY-MM-DD>/cover.webp`。[封面映射](../src/data/scene/assets.ts)按团队和日期自动匹配。
5. 将正式网址加入 [sitemap.xml](../public/sitemap.xml)，运行 `npm run check`。使用本地副本开启日志，查看团队列表、详情、封面和来源链接。

新增团队时，还要在 [types.ts](../src/data/scene/types.ts)、[routes.ts](../src/data/scene/routes.ts)、[catalog.ts](../src/data/scene/catalog.ts)、[runtime.ts](../src/data/scene/runtime.ts) 和 [assets.ts](../src/data/scene/assets.ts) 注册团队，添加集合页 HTML、SEO 定义和 sitemap 条目。需要导航或项目卡片时，再更新 [site.ts](../src/site.ts) 与对应卡片配置。

## SEO 与发布

[criticalPageContent.ts](../src/seo/criticalPageContent.ts)维护页面元数据、结构化数据和静态快照。[Vite 配置](../vite.config.ts)在构建时注入这些内容，单页 HTML 的 `title` 和 `description` 用于兜底。发布用的 PNG 放在 [public/og/](../public/og/)，可编辑的 [分享图 SVG 源稿](../design/og/liutongxue-share.svg)归在 `design/og/`。

新增或迁移路由时，核对 HTML 入口、[site.ts](../src/site.ts)、SEO 定义和 [sitemap.xml](../public/sitemap.xml)。`/tools/` 是迁移入口，Vercel 的重定向规则由 [vercel.json](../vercel.json)维护，本地跳转页见 [tools/index.html](../tools/index.html)。

更换正式域名时，要同步 `VITE_SITE_URL`、`VITE_CANONICAL_SITE_URL`、`ALLOWED_ORIGINS`、Vite 和 smoke check 的默认值，以及 [robots.txt](../public/robots.txt)、[sitemap.xml](../public/sitemap.xml)、[llms.txt](../public/llms.txt)、[llms-full.txt](../public/llms-full.txt) 和 [Pages workflow](../.github/workflows/deploy-pages.yml) 中的站点地址。启用登录时也要核对回调地址。

### 发布检查

1. 运行 `npm run check`，再以 `npm run preview` 打开本次改动的页面。路由改动同时检查正式站根路径和 Pages 的 `/liutongxue-web/` 子路径。
2. 涉及聊天时核对角色、演示回复和游客额度。部署后的服务验收要实际发送一条消息，确认接口和模型均可用。
3. 按项目的发布流程在 `test` 分支留档，验收后合入 `main`。Pages workflow 支持由 `main` 推送和手动触发，Vercel 按正式项目的生产分支配置上线。

Pages workflow 使用 `VITE_SITE_URL` 指向镜像地址、`VITE_CANONICAL_SITE_URL` 指向正式站，并以 `/liutongxue-web/` 为基路径构建。镜像输出带 `noindex`，canonical 和分享地址使用正式站。预览构建也可通过 `VITE_FORCE_NOINDEX=1` 强制添加 `noindex`。测试域名的抓取策略见 [vercel.json](../vercel.json)。

在 PowerShell 中可用同一组参数生成并检查本地镜像。

```powershell
$env:VITE_SITE_URL = 'https://dosliu.github.io/liutongxue-web/'
$env:VITE_CANONICAL_SITE_URL = 'https://ai.liutongxue.com.cn'
npm run build -- --base=/liutongxue-web/
npm run check:smoke
npm run preview -- --base=/liutongxue-web/
```

这组命令会把 `dist/` 更新为镜像产物。打开终端给出的带 `/liutongxue-web/` 的地址即可检查。
