# liutongxue-web

> Liutongxue 项目聚合展示站的前端仓库（正式地址：https://web.liutongxue.com.cn ，Vercel 托管）。  
> 这是一个 **多入口静态站点 + Vercel Serverless 聊天接口** 的组合项目。  
> 如果以后把这个项目交给另一个 AI 或开发者，建议优先按 **路由入口 → React 页面 → 文案/数据源 → SEO/静态资源 → 校验命令** 这条链路理解。

## 1. 项目简介

当前站点主要包含 3 类内容：

- 首页 `/`：站点主视觉、核心模块、联系区
- 人物页 `/figures/`，以及当前已落地的 6 个对话页（3 个人物：乔布斯 / 马斯克 / 张一鸣；3 个岗位 AI：客服助理 / 销售助理 / 口播短视频助理）
- Scene 页 `/scene/`，以及当前已落地的 3 个日志集合页、13 个日志详情页

项目以稳定维护和发布展示型站点为主；人物聊天链路同时保留后端模型接口与前端 fallback 演示回复，用于接口异常或未接通时兜底。

人物页同时带有一套登录与每日限额体系（大恩聚合登录 + KV 每日限额），维护前建议先读第 10.3 节。

### 当前正式地址

- `https://web.liutongxue.com.cn`（Vercel 托管，根路径部署）

> 原正式域名 `www.liutongxue.com.cn` 已归站长的简历网站使用，与本站不再相关。
> GitHub Pages（`dosliu.github.io/liutongxue-web`）保留为不收录的镜像，canonical 指向正式地址。

---

## 2. 技术栈

### 前端

- Vite 5
- React 19
- TypeScript 5
- Tailwind CSS 4（项目已接入，但当前站点主要样式仍维护在独立 CSS 文件中）
- OGL（首页视觉动效组件使用）

### 运行方式

- 多入口 HTML 构建，不是 React Router 单页路由
- 静态资源由 Vite 构建输出
- `api/chat.ts` 作为 Serverless 接口提供人物对话能力
- `api/auth/*` 与 `api/daen.ts` 作为 Serverless 接口提供大恩聚合登录与每日限额

### 维护上要先知道的事

- 这个项目更接近 **MPA（多页面应用）**，不是典型 SPA
- 关键页面的 SEO 信息（title / description / canonical / OG / 结构化数据 / 无 JS 静态快照）统一收口在 `src/seo/criticalPageContent.ts`，构建时由 `vite.config.ts` 注入；各 HTML 入口里的 `<title>` / `<meta description>` 只是兜底占位
- Scene 详情页正文不是 CMS，而是直接写在 `src/data/scene/*.ts`
- 人物聊天同时存在“后端模型接口链路”和“前端 fallback 演示链路”；两条链路共用 `api/_lib/figure-chat.ts` 同一份角色逻辑（前端 `src/features/figure-chat/core.ts` 只是 re-export，不需要双写 prompt）
- `api/_lib/` 下的 `.ts` 与 `.js` 是双份手工同步的文件；`api/*.ts`、`api/auth/*.js` 入口 import 的是 `.js`，只改 `.ts` 不同步 `.js` 时线上不会生效

---

## 3. 目录结构

```text
.
├─ api/
│  ├─ chat.ts                         # 人物聊天接口（Serverless）
│  ├─ daen.ts                         # 认证聚合入口（?route=login/callback/logout/me）
│  ├─ auth/
│  │  ├─ login.js                     # 发起大恩聚合登录（302 到登录页）
│  │  ├─ callback.js                  # OAuth 回调，写入签名 session cookie
│  │  ├─ logout.js                    # 退出登录，清除 session cookie
│  │  └─ me.js                        # 当前登录状态 + 今日限额快照
│  └─ _lib/                           # 共享逻辑；.ts 与 .js 双份手工同步，运行时走 .js
│     ├─ auth.ts / auth.js            # 大恩登录协议、签名 cookie session
│     ├─ figure-chat.ts / figure-chat.js  # 人物角色逻辑（前后端共用）
│     ├─ quota.js                     # 账号每日限额（Upstash / Vercel KV REST；仅 .js + .d.ts）
│     └─ http.ts / http.js            # CORS / JSON / redirect 工具
├─ public/
│  ├─ llms.txt
│  ├─ og/liutongxue-share.png         # og:image 分享图
│  ├─ robots.txt
│  └─ sitemap.xml
├─ src/
│  ├─ assets/
│  │  ├─ hero.webp
│  │  ├─ contact/
│  │  ├─ figures/
│  │  └─ scene/.../cover.webp         # Scene 详情页配图（走 Vite hash）
│  ├─ components/                     # 首页/全站通用组件
│  ├─ constants/                      # 首页文案常量
│  ├─ data/scene/                     # Scene 列表与详情页数据源
│  ├─ features/auth/                  # 登录状态获取与头部登录组件
│  ├─ features/figure-chat/           # 人物聊天前端逻辑
│  ├─ pages/                          # 页面组件
│  ├─ seo/criticalPageContent.ts      # 关键页 SEO 元数据 + 无 JS 静态快照
│  ├─ main.tsx
│  ├─ figures.tsx
│  ├─ scene.tsx
│  ├─ sceneLogCollection.tsx
│  ├─ sceneLogDetail.tsx
│  └─ site.ts                         # 全站路径与导航定义
├─ figures/.../index.html             # 人物页各路由 HTML 入口
├─ scene/.../index.html               # Scene 各路由 HTML 入口
├─ tools/index.html                   # /tools/ -> /scene/ 跳转页
├─ index.html                         # 首页 HTML 入口
├─ .github/workflows/deploy-pages.yml # GitHub Pages 部署（静态镜像，见 10.6）
├─ vite.config.ts                     # 多入口构建 + canonical / OG / 静态快照注入
├─ .env.example
└─ tools/smoke-check.mjs              # 路由 / sitemap / API / auth 回调检查
```

---

## 4. 本地开发与构建

### 安装依赖

```bash
npm install
```

### 启动前端开发环境

```bash
npm run dev
```

默认是 Vite 本地开发。

> 注意：
> 这个命令主要启动前端页面。  
> `api/chat.ts` 是 Serverless 入口，不会因为 `npm run dev` 自动一体化启动真实后端链路。  
> 如果本地需要真实聊天接口，要额外保证 `/api/chat` 可访问，或者通过环境变量指定 API 地址。
>
> `api/auth/*` 同样是 Serverless 入口：本地默认没有登录链路，头部登录组件会提示“暂时无法确认登录状态”，属预期现象。

### 生产构建

```bash
npm run build
```

等价于：

```bash
tsc && vite build
```

### 本地预览构建产物

```bash
npm run preview
```

### 完整检查（推荐提交前执行）

```bash
npm run check
```

等价于：

```bash
npm run build && npm run check:smoke
```

### 仅做 smoke check

```bash
npm run check:smoke
```

这个检查会验证：

- 关键 HTML 入口是否存在
- `src/site.ts` 声明的路由是否都已落地
- `public/sitemap.xml` 是否与实际路由一致
- `/scene/**` 目录是否存在缺失入口
- `api/chat.ts` 健康检查是否通过
- auth 回调口径是否锁定为 `/api/auth/callback`（含 `.env.example` 里的 canonical 回调写法）

---

## 5. 路由 / 页面结构概览

这个项目的路由不是由 React Router 管，而是由 **真实存在的 HTML 文件 + 对应 TSX 入口** 组成。

| 路由 | HTML 入口 | TSX 入口 | React 页面 / 数据源 |
| --- | --- | --- | --- |
| `/` | `index.html` | `src/main.tsx` | `src/App.tsx` -> `src/pages/HomePage.tsx` |
| `/figures/` | `figures/index.html` | `src/figures.tsx` | `src/pages/FiguresPage.tsx` |
| `/figures/steve-jobs/` | `figures/steve-jobs/index.html` | `src/figures-steve-jobs.tsx` | `features/figure-chat` |
| `/figures/elon-musk/` | `figures/elon-musk/index.html` | `src/figures-elon-musk.tsx` | `features/figure-chat` |
| `/figures/zhang-yiming/` | `figures/zhang-yiming/index.html` | `src/figures-zhang-yiming.tsx` | `features/figure-chat` |
| `/figures/customer-service/` | `figures/customer-service/index.html` | `src/figures-customer-service.tsx` | `features/figure-chat` |
| `/figures/sales-assistant/` | `figures/sales-assistant/index.html` | `src/figures-sales-assistant.tsx` | `features/figure-chat` |
| `/figures/video-script-assistant/` | `figures/video-script-assistant/index.html` | `src/figures-video-script-assistant.tsx` | `features/figure-chat` |
| `/scene/` | `scene/index.html` | `src/scene.tsx` | `src/pages/ScenePage.tsx` |
| `/scene/digital-resident/` | `scene/digital-resident/index.html` | `src/sceneLogCollection.tsx` | `src/data/scene/digital-resident.ts` |
| `/scene/blog-ops/` | `scene/blog-ops/index.html` | `src/sceneLogCollection.tsx` | `src/data/scene/blog-ops.ts` |
| `/scene/site-ops/` | `scene/site-ops/index.html` | `src/sceneLogCollection.tsx` | `src/data/scene/site-ops.ts` |
| `/scene/.../YYYY-MM-DD/` | 各详情页 `index.html` | `src/sceneLogDetail.tsx` | 对应 `src/data/scene/*.ts` 中的 `detailContent` |
| `/tools/` | `tools/index.html` | 无 React 页面 | 纯跳转到 `/scene/` |

### 认证 API 路由

| 路由 | 文件入口 | 行为 |
| --- | --- | --- |
| `/api/auth/login?type=qq\|baidu` | `api/auth/login.js` | 写入签名 state cookie 后 302 到大恩登录页 |
| `/api/auth/callback` | `api/auth/callback.js` | 校验 state、换取用户资料，写入签名 session cookie，按 `return_to` 回跳 |
| `/api/auth/logout` | `api/auth/logout.js` | 清除 session cookie；GET 302 回站，POST 返回 JSON |
| `/api/auth/me` | `api/auth/me.js` | 返回登录状态、登录方式列表与今日限额快照 |
| `/api/daen?route=...` | `api/daen.ts` | 旧聚合入口，按 query 分发到上面四个 handler |

### Scene 详情页实际来源

Scene 详情页不是逐个写 JSX，而是：

1. `scene/.../日期/index.html` 提供独立路由入口
2. `src/sceneLogDetail.tsx` 读取当前 URL
3. `src/data/scene/routes.ts` 解析 sceneKey + 日期
4. `src/data/scene/*.ts` 提供标题、正文、图片、来源链接

也就是说：**Scene 内容维护核心不在 page 组件，而在 data 文件。**

---

## 6. 常见修改入口

## 6.1 首页怎么改

首页主入口：

- `src/pages/HomePage.tsx`

首页由这些区块组成：

- Hero 首屏：`src/pages/HomePage.tsx`
- 案发现场卡片区：`src/components/ToolsSection.tsx`
- 数智灵言滚动区：`src/components/TestimonialsSection.tsx`
- 数智履痕统计区：`src/components/FeatureCardsSection.tsx`
- 联系区：`src/components/StartBuildingSection.tsx`
- 页脚：`src/components/SiteFooter.tsx`

### 首页文案分别在哪改

| 内容 | 文件 |
| --- | --- |
| 首页 H1 / 副标题 | `src/pages/HomePage.tsx` |
| “案发现场”卡片文案 | `src/constants/toolsShowcase.ts` |
| “数智灵言”滚动语录 | `src/constants/testimonials.ts` |
| “数智履痕”统计数字和文案 | `src/components/FeatureCardsSection.tsx` |
| 联系区标题和说明 | `src/components/StartBuildingSection.tsx` |
| 页脚文案 | `src/components/SiteFooter.tsx` |

### 首页图片在哪里改

| 图片 | 文件 |
| --- | --- |
| 首屏背景图 | `src/assets/hero.webp` |
| 联系区微信二维码 | `src/assets/contact/wechat-qr.jpg` |
| 联系区飞书二维码 | `src/assets/contact/feishu-qr.jpg` |

### 首页 SEO 在哪里改

- `index.html`
  - 首页 `<title>`
  - 首页 `<meta name="description">`

> 页面里看得见的标题/副标题改 `HomePage.tsx`。  
> 浏览器标题栏、搜索 description 改 `index.html`。

---

## 6.2 人物页怎么改

### 人物入口页（人物列表）

- 页面：`src/pages/FiguresPage.tsx`

这里控制：

- 人物卡片顺序
- 人物名称
- 人物头像
- 人物入口链接
- 页面主标题 / 副标题

### 人物头像在哪里改

- `src/assets/figures/steve-jobs.jpg`
- `src/assets/figures/elon-musk.jpg`
- `src/assets/figures/zhang-yiming.jpg`
- `src/assets/figures/customer-service.png`
- `src/assets/figures/sales-assistant.png`
- `src/assets/figures/video-script-assistant.png`

### 人物入口页 SEO 在哪里改

- `figures/index.html`
  - `<title>`
  - `<meta name="description">`

### 人物聊天页 UI 在哪里改

共用聊天页面：

- `src/features/figure-chat/FigureChatPage.tsx`

这里控制：

- 聊天页布局
- 按钮文案
- 输入框
- 状态显示
- 清空会话行为

### 每个人物的页面文案 / 展示标签 / freeLimit 配置在哪里改

- `src/features/figure-chat/shared.ts`

这里维护每个角色的前端配置项，包括：

- `title`
- `description`
- `assistantLabel`
- `panelAriaLabel`
- `storageKey`
- `freeLimit`

其中 `freeLimit` 为角色配置字段，修改时应结合当前前后端实际限制逻辑一起确认，不应仅按文案字段理解。

### 人物详情页 head 区在哪里改

人物页 SEO（title / description / OG / 结构化数据 / 静态快照）统一由 `src/seo/criticalPageContent.ts` 的 `figureSeoDefinitions` 维护，构建时自动注入并覆盖 HTML 占位。

`figures/steve-jobs/index.html` 这类 HTML 入口里的 `<title>` / `<meta name="description">` 只作为兜底，一般不需要直接改。

### 人物回复策略相关逻辑在哪里改

前端 fallback 演示回复逻辑：

- `src/features/figure-chat/core.ts`

后端模型接口中的人物提示词与回复规则：

- `api/chat.ts`

> 维护原则：  
> 这两个文件分别承载前端兜底链路与后端接口链路的人物逻辑。  
> 如果修改人物设定、回复规则或 fallback 行为，需要同时核对两处实现，避免在线接口返回与前端兜底返回出现明显漂移。

### 6.2.1 新增聊天人物 SOP

如果不是修改现有 6 个对话入口，而是并行新增一个新人物或新岗位，建议按下面顺序做：

1. 先确定人物 slug，例如：`figures/new-person/`
2. 在 `src/site.ts` 补人物路径常量
3. 新建人物页 HTML 入口：`figures/<slug>/index.html`
4. 新建对应入口文件，参考：
   - `src/figures-steve-jobs.tsx`
   - `src/figures-elon-musk.tsx`
   - `src/figures-zhang-yiming.tsx`
5. 在 `src/pages/FiguresPage.tsx` 补入口卡片、名称、头像、链接
6. 在 `src/assets/figures/` 补头像资源
7. 在 `src/features/figure-chat/shared.ts` 补前端配置：
   - `title`
   - `description`
   - `assistantLabel`
   - `panelAriaLabel`
   - `storageKey`
   - `freeLimit`
8. 如果人物设定、fallback 或 prompt 有变化，同时检查：
   - `src/features/figure-chat/core.ts`
   - `api/chat.ts`
9. 新人物页落地后，同步补：
    - `public/sitemap.xml`
    - `src/seo/criticalPageContent.ts` 里的 `figureSeoDefinitions`（新页面的 SEO 元数据与静态快照）
10. 最后执行：
    - `npm run check`
    - 手动打开新人物页，至少确认 1 次 fallback 链路可用

> 说明：
> 当前 `vite.config.ts` 会自动收集 `figures/**/index.html` 作为多入口构建输入，
> 所以新增人物页时通常**不用**手动再改 rollup input；重点是把 HTML 入口、`src/site.ts`、人物配置和 sitemap 对齐。

---

## 6.3 Scene 页怎么改

### Scene 总入口页

- 页面：`src/pages/ScenePage.tsx`

这里控制：

- 3 个 scene 入口卡片标题
- 卡片说明
- 入口链接

### Scene 总入口页 SEO 在哪里改

- `scene/index.html`

### Scene 集合页 / 详情页内容在哪里改

核心数据都在：

- `src/data/scene/digital-resident.ts`
- `src/data/scene/blog-ops.ts`
- `src/data/scene/site-ops.ts`

这些文件控制：

- 集合页 `title`
- 集合页 `subtitle`
- 日志列表 `logs`
- 每条日志 `title / preview / summary / detailHref`
- 详情页正文 `detailContent`
- 详情页标题 `detailTitle`
- 详情页图片 / 配图 alt / caption
- 外链来源 `sourceHref` / `sourceLabel`

### Scene 路由规则在哪里改

- `src/data/scene/routes.ts`
- `src/site.ts`

### Scene 列表页模板在哪里改

- `src/pages/SceneTeamLogPage.tsx`

### Scene 详情页模板在哪里改

- `src/pages/SceneLogDetailPage.tsx`

### Scene 详情页 head 区在哪里改

- `scene/*/*/index.html`

例如：

- `scene/blog-ops/2026-03-13/index.html`
- `scene/digital-resident/2026-03-21/index.html`
- `scene/site-ops/2026-04-01/index.html`

这里改：

- `<title>`
- `<meta name="description">`

### Scene 详情页图片在哪里改

当前详情页 cover 图放在：

- `src/assets/scene/**/cover.webp`

例如：

- `src/assets/scene/blog-ops/2026-03-13/cover.webp`
- `src/assets/scene/digital-resident/2026-03-21/cover.webp`
- `src/assets/scene/site-ops/2026-04-01/cover.webp`

并且运行时通过 `src/data/scene/assets.ts` 的资源映射层自动解析，不再手工拼 `public` 路径。

> 这类图片目录仍然要和路由严格对齐，但引用已经收口到映射层，避免手工字符串路径长期漂移。

### 6.3.1 新增 scene 日志 / 详情页 SOP

#### 给已有团队页新增一条“仅列表显示”的日志

1. 找到对应数据文件：
   - `src/data/scene/digital-resident.ts`
   - `src/data/scene/blog-ops.ts`
   - `src/data/scene/site-ops.ts`
2. 往 `logs` 数组新增一项
3. 至少补齐：
   - `id`
   - `publishedAt`
   - `title`
   - `preview`
   - `summary`
4. 如果不填 `detailHref`，这条日志只会显示在列表里，不会进入详情页

#### 给已有团队页新增一条“带详情页”的日志

1. 先在对应数据文件里补详情字段：
   - `detailHref`
   - `detailTitle`
   - `detailContent`
   - `detailImageAlt`
   - `detailImageCaption`（可选）
   - `sourceHref` / `sourceLabel`（可选）
2. 在 `src/site.ts` 的 `sceneLogDetails` 里补路径常量
3. 新建详情页 HTML 入口，例如：
   - `scene/digital-resident/2026-03-28/index.html`
4. 如果有配图，把图片放到：
   - `src/assets/scene/<scene-segment>/<date>/cover.webp`
5. 资源映射由 `src/data/scene/assets.ts` 自动收录；目录命名必须和 scene route segment + 日期一致
6. 手动补 `public/sitemap.xml`
7. 最后执行：
   - `npm run check`
   - 手动打开对应团队页和详情页各 1 次

#### 新增一个新的 scene 团队页

除了补日志数据，还要同步补这些位置：

- `src/data/scene/index.ts`
- `src/data/scene/routes.ts`
- `src/site.ts`
- `scene/<new-scene>/index.html`
- `src/pages/ScenePage.tsx`
- 首页 `src/constants/toolsShowcase.ts`（如果首页要露出这个入口）
- `public/sitemap.xml`

> 说明：
> 当前 scene 详情页不是运行时动态生成，而是“数据对象 + 独立 HTML 路由入口”组合。  
> 但它也不是一条日志对应一个独立 TSX 入口；详情页统一复用 `src/sceneLogDetail.tsx`，
> 关键是把 `src/site.ts`、数据文件、`scene/**/index.html` 和 sitemap 对齐。

---

## 6.4 联系区怎么改

联系区组件：

- `src/components/StartBuildingSection.tsx`

这里可以改：

- 标题（如“与我链接”）
- 描述文案
- 二维码布局

二维码图片：

- `src/assets/contact/wechat-qr.jpg`
- `src/assets/contact/feishu-qr.jpg`

### 额外说明

`src/site.ts` 里虽然定义了：

```ts
contact: 'mailto:hello@liutongxue.com'
```

但当前首页联系区的实际用户承接方式是二维码展示；该 mailto 常量当前不是首页主 CTA。

同时，头部导航中的“具身AI”已在 `src/components/SiteHeader.tsx` 的 `reservedNavTargets` 中指向 `/figures/`；以后如果要给“具身AI”更换正式入口，改这一处即可。

---

## 6.5 Header / Footer / 导航怎么改

### 全站路径与导航

- `src/site.ts`

这里维护：

- `sitePaths`
- `siteNavItems`

### Header 导航行为

- `src/components/SiteHeader.tsx`

这里控制：

- header 结构
- 导航高亮
- 当前禁用项的展示逻辑

### Footer

- `src/components/SiteFooter.tsx`

### Logo

- `src/components/ReactBitsLogo.tsx`

页头和页脚都复用这个 Logo。

---

## 7. title / description / canonical / OG 在哪里改

### 页面 title / meta description

当前分两层维护：

- **关键页面**（首页、`/figures/` 与 6 个对话页、`/scene/` 与全部集合页 / 详情页）：title / description 统一在 `src/seo/criticalPageContent.ts` 的 `criticalPageContent` 里维护；scene 详情页的 `seoTitle` / `seoDescription` 来自 `src/data/scene/*.ts` 日志数据。构建时由 `vite.config.ts` 计算并覆盖写回 HTML
- **各 HTML 入口文件**（`index.html`、`figures/**/*.html`、`scene/**/*.html`、`tools/index.html`）里的 `<title>` / `<meta name="description">`：只在页面不在 `criticalPageContent` 覆盖范围时兜底生效；当前关键页 HTML 里多为占位值，一般不用直接改

也就是说，**改关键页的 SEO 文案优先去 `src/seo/criticalPageContent.ts`，而不是逐个 HTML 文件。**

### canonical / OG 在哪里改

统一逻辑在：

- `vite.config.ts`

这里会在构建时自动注入：

- `canonical`
- `og:site_name`
- `og:type`
- `og:locale`
- `og:title`
- `og:description`
- `og:url`
- `og:image` / `twitter` 卡片系列（默认 `public/og/liutongxue-share.png`）
- JSON-LD 结构化数据（主实体 / 面包屑 / FAQ）
- 关键页还会把无 JS 静态快照预渲染进 `#root`
- 非 canonical 构建（如 TEST）时的 `robots=noindex,nofollow,noarchive`

注入所依赖的数据来源：

- 当前 HTML 文件里的 `<title>`
- 当前 HTML 文件里的 `<meta name="description">`
- `VITE_CANONICAL_SITE_URL`（正式 canonical 域名）
- `VITE_SITE_URL`（当前构建实际部署域名 / 预览域名）

> 当前约定是：
> - 默认（Vercel 正式站）：`VITE_SITE_URL` 与 `VITE_CANONICAL_SITE_URL` 都指向 `https://web.liutongxue.com.cn`，正常收录
> - GitHub Pages 镜像构建（workflow 覆盖）：`VITE_SITE_URL` 指向 Pages 地址，`VITE_CANONICAL_SITE_URL` 仍指向正式地址
> - 因此 Pages 镜像自动注入 `noindex`；`canonical` / `og:url` 一律按正式地址根路径书写（`https://web.liutongxue.com.cn/scene/...`）

### `/tools/` 的 canonical 特殊逻辑

- `vite.config.ts`
  - `canonicalPathOverrides`

当前把：

- `/tools/` canonical 到 `/scene/`

因为 `/tools/` 现在只是兼容旧入口，不再作为独立内容页维护。

> 当前 `vite.config.ts` 会为所有页面统一注入 `og:image` / `twitter:image`，默认指向 `public/og/liutongxue-share.png`（1200x630）。  
> 要更换分享图，替换 `vite.config.ts` 里的 `defaultSocialImagePath` 或直接替换 `public/og/` 下的文件。

---

## 8. sitemap / route / tools 跳转相关

### sitemap

- `public/sitemap.xml`

当前是手工维护。

### robots

- `public/robots.txt`

### llms / GEO 文本口径

- `public/llms.txt`

当前用途：

- 提供给模型 / 检索系统的站点定义文本
- 明确正式 canonical 域名口径
- 约束不要把 TEST 域名当成可引用来源

### 全站路径常量

- `src/site.ts`

### scene 路由解析规则

- `src/data/scene/routes.ts`

### `/tools/` 跳转页

- `tools/index.html`

当前行为：

- `/tools/` 旧入口跳转到 `/scene/`

### smoke check 校验逻辑

- `tools/smoke-check.mjs`

会校验：

- 关键入口文件是否存在
- `src/site.ts` 声明路由是否有真实落地文件
- `public/sitemap.xml` 是否与真实路由一致
- scene 日期目录是否缺 `index.html`
- `api/chat.ts` 健康检查
- auth 回调归一化检查（回调真源锁定为 `/api/auth/callback`）

> 新增页面不应仅补 HTML 入口，通常还需要同步检查并补齐以下项：
> - 路径常量
> - scene 数据（如有）
> - sitemap
> - 必要时 smoke check 规则

---

## 9. 图片 / 静态资源放在哪里

### 页面打包型资源（由 Vite hash 处理）

适合首页、人物、二维码这类组件内 import 的资源：

- `src/assets/hero.webp`
- `src/assets/contact/*`
- `src/assets/figures/*`

### 保持原 URL 路径的静态资源

适合 sitemap / robots 这类必须保留固定公开路径的资源：

- `public/robots.txt`
- `public/sitemap.xml`

### Scene 详情页配图资源

Scene cover 图放在 `src/assets/scene/**/cover.webp`，由 `src/data/scene/assets.ts` 统一映射后进入构建，最终走 Vite hash 产物。

### 构建产物

- `dist/`

---

## 10. 环境变量、聊天接入与部署约定

当前公开访问方式：

- 主站页面：`https://web.liutongxue.com.cn/`（Vercel 正式站）
- 真实模型 API：`api/chat.ts`（随 Vercel 部署；配置 `OPENAI_API_KEY` 后为真实模型，未配置时自动回退演示回复）

### 10.1 环境变量总表

README 中提到的本地开发、构建与 smoke check 已经在第 4 章写明；
这里补的是“聊天链路 / 登录限额 / canonical / 域名迁移”相关的变量说明。

| 变量名 | 是否必填 | 读取位置 | 用途 | 默认行为 / 备注 |
| --- | --- | --- | --- | --- |
| `VITE_JOBS_CHAT_API_BASE_URL` | 否 | `src/features/figure-chat/runtime.ts` | 指定聊天接口基地址 | 前端和 `/api/chat` 不同域时使用；留空时默认走当前域名下的 `/api/chat`。填 `/` 时也会强制走同域。 |
| `VITE_CHAT_API_URL` | 否 | `src/features/figure-chat/runtime.ts` | 直接指定完整聊天接口地址 | 优先级高于 `VITE_JOBS_CHAT_API_BASE_URL`，通常只用于特殊调试或兼容场景。 |
| `VITE_SITE_URL` | 否（默认值即正式口径） | `vite.config.ts`、`tools/smoke-check.mjs` | 当前构建实际部署域名；也作为 smoke check 默认站点地址 | 默认值是 `https://web.liutongxue.com.cn`；Pages 镜像构建时由 workflow 覆盖为 Pages 地址。 |
| `VITE_CANONICAL_SITE_URL` | 否（默认值即正式口径） | `vite.config.ts` | `canonical` / `og:url` / 结构化数据中使用的口径域名 | 默认值是 `https://web.liutongxue.com.cn`。 |
| `VITE_FORCE_NOINDEX` | 可选开关（当前未启用） | `vite.config.ts`、`tools/smoke-check.mjs` | 强制整站注入 noindex | 设为 `1` 时无论 URL 口径是否一致都注入 noindex；Pages 镜像的 noindex 由两个 URL 不一致自动触发。 |
| `OPENAI_API_KEY` | 真实模型时必填 | `api/chat.ts` | 调用 OpenAI 兼容接口 | 不填时前端会退回演示回复。 |
| `OPENAI_MODEL` | 否 | `api/chat.ts` | 指定模型名 | 默认值是 `gpt-4.1-mini`。 |
| `OPENAI_BASE_URL` | 否 | `api/chat.ts` | 指定 OpenAI 兼容网关地址 | 默认值是 `https://api.openai.com/v1`。 |
| `ALLOWED_ORIGINS` | 生产强烈建议填写 | `api/chat.ts` | 控制允许跨域访问 API 的前端来源 | 多个域名用英文逗号分隔；本地和已知预览来源要显式纳入。 |
| `DAEN_CONNECT_URL` | 登录功能必填 | `api/_lib/auth.js` | 大恩聚合登录统一接口地址 | 默认 `https://u.daenwl.com/connect.php`。 |
| `DAEN_ENABLED_TYPES` | 登录功能必填 | `api/_lib/auth.js` | 当前开放的登录方式 | 逗号分隔；当前为 `qq,baidu`。 |
| `DAEN_APP_ID` / `DAEN_APP_KEY` | 登录功能必填 | `api/_lib/auth.js` | 大恩应用凭证 | 真实值只放环境变量，不要提交进仓库。 |
| `DAEN_AUTH_CALLBACK_URL` | 登录功能必填 | `api/_lib/auth.js` | OAuth 回调地址 | 即使误填旧地址，运行时也会自动收敛到 `/api/auth/callback`。 |
| `AUTH_SESSION_SECRET` | 登录功能必填 | `api/_lib/auth.js` | 签名 state / session cookie 的密钥 | 至少 32 位随机字符串。 |
| `AUTH_SESSION_TTL_SECONDS` | 否 | `api/_lib/auth.js` | session 有效期 | 默认 604800（7 天）。 |
| `AUTH_SESSION_COOKIE_NAME` / `AUTH_STATE_COOKIE_NAME` | 否 | `api/_lib/auth.js` | session / state cookie 名 | 默认 `liutongxue_session` / `liutongxue_auth_state`。 |
| `AUTH_LOGIN_SUCCESS_URL` / `AUTH_LOGOUT_REDIRECT_URL` | 否 | `api/_lib/auth.js` | 登录成功 / 退出后的回站地址 | 默认 `/figures/`；从具体人物页发起登录会优先回跳原页面。 |
| `AUTH_DAILY_LIMIT` | 否 | `api/_lib/auth.js`、`api/_lib/quota.js` | 已登录账号的人物对话每日限额 | 默认 10。 |
| `AUTH_KV_ENABLED` | 启用账号限额时必填 | `api/_lib/quota.js` | 是否启用账号每日限额 | 需与下面两个 KV REST 变量同时配置。 |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 启用账号限额时必填 | `api/_lib/quota.js` | Upstash / Vercel KV REST 凭证 | 未完整配置时返回 `quota.mode=unavailable`，前端显示“今日次数待确认”，不误导为已生效。 |
| `KV_URL` | 否 | — | 可选，保留给其他 KV 用途 | 人物对话限额当前只走 REST。 |

### 10.2 几种常见运行场景

#### 场景 A：前端与 API 同域部署

例如：整站都部署在正式域名下。

- 通常不需要配置 `VITE_JOBS_CHAT_API_BASE_URL`
- 前端会默认请求当前域名下的 `/api/chat`
- 重点确认：
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `OPENAI_BASE_URL`
  - `ALLOWED_ORIGINS`
  - `VITE_SITE_URL`

#### 场景 B：前端与 API 分域部署

例如：前端走静态托管，聊天接口单独挂在另一个域名。

```bash
VITE_JOBS_CHAT_API_BASE_URL=https://api.example.com
```

同时后端要把前端域名加入 `ALLOWED_ORIGINS`。

#### 场景 C：GitHub Pages 镜像构建

配置（已内置于 workflow）：

```bash
VITE_SITE_URL=https://dosliu.github.io/liutongxue-web
VITE_CANONICAL_SITE_URL=https://web.liutongxue.com.cn
```

当前行为：

- 页面部署在 GitHub Pages（项目页子路径）
- `canonical` / `og:url` / 结构化数据指向正式地址 `web.liutongxue.com.cn`
- 两个 URL 不一致使镜像自动注入 `noindex, nofollow, noarchive`，不会被收录

#### 场景 D：本地调试

- 本地 `npm run dev` 主要启动前端页面
- 如果本地没有真实 `/api/chat`，聊天页会自动 fallback
- 如果想连远端接口，通常显式配置 `VITE_JOBS_CHAT_API_BASE_URL` 更稳
- 本地联调完成后，提交前建议执行：

```bash
npm run check
```

### 10.3 登录与每日限额链路

当前登录体系基于“大恩聚合登录”（OAuth 承接 QQ / 百度），由 Vercel Serverless 承载：

| 环节 | 位置 |
| --- | --- |
| 登录协议与签名 cookie session | `api/_lib/auth.ts`（运行时走 `auth.js`） |
| 登录 / 回调 / 退出 / 状态接口 | `api/auth/login.js`、`callback.js`、`logout.js`、`me.js` |
| 旧聚合分发入口 | `api/daen.ts`（`?route=login\|callback\|logout\|me`） |
| 前端登录状态获取 | `src/features/auth/useAuthEntryState.ts`（请求 `/api/auth/me`） |
| 头部登录 / 账号组件 | `src/features/auth/AuthHeaderWidget.tsx`（桌面端）+ `src/components/SiteHeader.tsx`（移动端下拉） |
| 账号每日限额 | `api/_lib/quota.js`（Upstash / Vercel KV REST） |

当前行为约定：

- 登录流程：`/api/auth/login?type=qq|baidu` 写入签名 state cookie 并 302 到大恩 → 大恩回调 `/api/auth/callback` → 校验 state、换取用户资料 → 写入 HMAC 签名的 session cookie → 按 `return_to` 回跳原页面（带 `?auth=signed-in` / `auth-error` 提示）
- 未登录：每设备可体验 5 次（前端 localStorage，所有角色共享 `liutongxue-figure-chat-remaining`）
- 已登录：每账号每日 10 次（`AUTH_DAILY_LIMIT`），按上海时区零点重置；服务端经 KV REST 按 subject 扣减，`api/chat.ts` 在调用模型前先预留额度，模型失败会回滚
- KV 未完整配置时：接口返回 `quota.mode=unavailable`，前端显示“今日次数待确认”，不会误报额度已生效
- `src/features/auth/AuthEntryCard.tsx` 当前没有被任何页面引用（登录入口已收进头部导航），属于保留的历史组件

### 10.4 人物聊天链路的当前约定

当前人物聊天链路是：

- 前端接口地址解析：`src/features/figure-chat/runtime.ts`
- 前端兜底与角色逻辑：`src/features/figure-chat/core.ts`
- 每个人物的前端配置：`src/features/figure-chat/shared.ts`
- 真实模型接口：`api/chat.ts`

当前行为：

- 同域访问时，聊天页默认请求当前域名下的 `/api/chat`
- 如果缺少模型变量或接口不可达，前端会自动回退到演示回复
- 如果后端函数加载失败，前端会显示未连接或 fallback 状态
- 登录用户的响应会带 `quota` 字段（scope / remaining / limit / mode / exhausted），前端据此展示“今日剩余”，并把 429 转成限额提示

### 10.5 部署与域名口径

#### 域名口径

- 正式地址：`https://web.liutongxue.com.cn`（Vercel 托管，根路径部署，正常收录）
- 原正式域名 `www.liutongxue.com.cn` 已归站长的简历网站使用，本站一切口径不再引用它
- GitHub Pages 为不收录镜像，canonical 指向正式地址；未来更换域名时，全局替换 sitemap / robots / llms.txt / README / workflow 中的口径即可

#### 发布流程（2026-09 起：本地验收）

当前默认发布顺序是：

1. 本地改动
2. 本地验证：至少 `npm run check`，再用 `npm run dev` / `npm run preview` 逐页人工验收
3. 同步到 `test` 分支留档
4. 验收通过后合入 `main`

补充约束：

- 2026-09 起 TEST 域名（test.liutongxue.com.cn）已停用不可达，验收以本地预览为准
- 合入 `main` 即同时发布正式站（Vercel www）与 GitHub Pages 镜像，合入前必须完成本地逐页验收
- 不要把 TEST 域名当成正式索引入口（构建层仍会自动 noindex）

#### 当前已验证的部署形态

当前项目是：

- 多入口静态页面
- 同项目下的 `api/chat.ts` Serverless 接口
- 正式站由 Vercel 托管（根路径，`https://web.liutongxue.com.cn`）；GitHub Pages 项目页为不收录镜像

也就是说：

- 静态页面可以部署在任意静态托管平台
- `api/chat.ts` 需要能运行 Node / Serverless 的平台
- README 维护时应优先描述“域名口径与部署约束”，不要把某个平台写成唯一前提

#### 正式域名迁移时要同步确认的地方

- `VITE_SITE_URL`
- `VITE_CANONICAL_SITE_URL`
- `vite.config.ts` 里的默认 `canonicalSiteUrl` / `siteUrl`
- `tools/smoke-check.mjs` 里的默认 `siteUrl`
- `.env.example`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/llms.txt`
- README 中的正式域名文案
- `ALLOWED_ORIGINS`

### 10.6 GitHub Pages 部署（静态镜像）

仓库自带 `.github/workflows/deploy-pages.yml`，push 到 `main` 或手动触发（workflow_dispatch）即可构建并发布到 GitHub Pages。

#### 先知道的约束

- GitHub Pages 只能托管静态产物；`api/` 下的 Serverless（真实模型聊天、登录、账号限额）在 Pages 上不可用
- Pages 上的聊天页会走项目自带的兜底：接口健康检查失败后自动降级为演示回复（offline / mock 状态），不扣次数
- 头部登录组件会提示“暂时无法确认登录状态”，属预期现象

#### 首次启用步骤

1. 打开 GitHub 仓库 → `Settings` → `Pages`
2. `Build and deployment` → `Source` 选择 **GitHub Actions**
3. push 到 `main`（或在 Actions 页手动 Run workflow）
4. 完成后镜像地址为：`https://dosliu.github.io/liutongxue-web/`

> 免费计划要求仓库为 public；private 仓库需要 GitHub Pro 及以上。

#### 当前默认：镜像模式

workflow 顶部 env 集中管理：

- `VITE_SITE_URL` = Pages 地址
- `VITE_CANONICAL_SITE_URL` = 正式地址 `https://web.liutongxue.com.cn`
- `PAGES_BASE` = `/liutongxue-web/`（项目页必须带 base 路径）

两者不一致时，镜像产物自动注入整站 `noindex`，`canonical` / `og:url` 指向正式地址——与 Vercel 正式站不产生收录冲突。

已知限制：`src/seo/criticalPageContent.ts` 静态快照里的站内链接是根路径硬编码（如 `/scene/`），项目页子路径部署下，无 JS 环境点击这些快照链接会 404；React 加载后由 `src/site.ts` 的 BASE_URL 路径接管，正常可用。正式站（根路径部署）无此问题。

#### Vercel 正式站

Vercel 项目连接着本仓库，push 到 `main` 会自动部署正式站（根路径，`https://web.liutongxue.com.cn`）。

`api/` 下的 Serverless 随 Vercel 一起上线，未配置模型变量时聊天自动回退演示回复；在项目 Settings → Environment Variables 配置 `OPENAI_API_KEY`（可选 `OPENAI_MODEL` / `OPENAI_BASE_URL`）后恢复真实模型回复，配置 `DAEN_*` / `AUTH_*` 系列后，登录与账号每日限额在同一域名下直接可用。

---

## 11. 高风险 / 不要轻易乱动的区域

以下区域属于高风险变更点；除非需求明确，否则不建议进行顺手重构或结构性调整：

### 1) `api/chat.ts`

原因：

- 人物聊天真实模型接入入口
- 涉及 CORS、fallback、Serverless 运行时
- 改坏会直接影响线上聊天可用性

### 2) `api/_lib/figure-chat.ts`（前端 `src/features/figure-chat/core.ts` 只是 re-export）

原因：

- 同时承载 6 个角色的人物 system prompt、直出规则、mock 逻辑
- 轻微改动就会显著改变角色口吻与稳定性
- 注意 `.ts` / `.js` 双份手工同步，改一份要同步另一份

### 3) `src/features/figure-chat/shared.ts`

原因：

- 角色标题、描述、免费次数、storageKey 都在这里
- 改错容易造成角色串配或缓存污染

### 4) `src/site.ts`

原因：

- 是全站路径与导航常量单点
- 改错容易全站断链

### 5) `src/data/scene/routes.ts`

原因：

- scene 集合页 / 详情页依赖这里做 pathname 解析
- 一旦规则出错，整批 scene 页面会挂

### 6) `vite.config.ts`

原因：

- 控制多入口构建、canonical、OG 注入和 `/tools/` 的 canonical 特殊逻辑
- 改动会影响构建与 SEO

### 7) `tools/smoke-check.mjs`

原因：

- 这是项目当前的路由一致性守门脚本
- 改它等于改验收标准

### 8) `api/_lib/auth.ts` / `api/_lib/auth.js`

原因：

- 承载大恩登录协议、state / session 签名 cookie，是鉴权安全边界
- 改坏会直接影响登录可用性，甚至引入伪造 session 的风险

### 9) `api/_lib/quota.js`

原因：

- 账号每日限额的唯一实现（KV REST 扣减、回滚、上海时区重置）
- 只有 `.js` + `.d.ts`，没有 `.ts` 源码版

### 10) `src/seo/criticalPageContent.ts`

原因：

- 关键页 title / description / 结构化数据 / 无 JS 快照的唯一来源
- 改错会直接影响搜索收录与分享卡片

---

## 12. 提交前建议流程

每次改动后，建议按这个顺序做：

```bash
npm run check
```

如果涉及下面这些改动，再额外人工确认：

- 新增 / 删除页面
- 修改 `src/site.ts`
- 修改 `public/sitemap.xml`
- 修改 `api/chat.ts`
- 修改人物聊天 prompt / mock / fallback
- 修改登录 / 限额相关文件（`api/auth/*`、`api/_lib/auth.*`、`api/_lib/quota.js`）
- 修改 scene 数据和图片路径

推荐最小检查清单：

1. `npm run check`
2. 打开首页 `/`
3. 打开至少 1 个人物页
4. 打开至少 1 个 scene 集合页
5. 打开至少 1 个 scene 详情页
6. 如果碰了聊天逻辑，再检查 `/api/chat`
7. 如果碰了登录或限额逻辑，再检查 `/api/auth/me` 与人物页限额展示

---

## 13. 交接建议

如果以后交给另一个 AI 或开发者继续维护，建议这样理解这个项目：

1. 先看 `README`
2. 再看 `src/site.ts`，理解全站路径
3. 再看 `vite.config.ts` 与 `src/seo/criticalPageContent.ts`，理解多入口、SEO 注入与静态快照
4. 再看 `src/pages/*` 与 `src/data/scene/*`
5. 最后再碰 `features/figure-chat/*`、`api/chat.ts`、`api/auth/*` 与 `api/_lib/*`

优先做 **小范围精确修改**，不要上来就尝试把它重构成另一套架构。

当前这套站已经稳定跑通，维护重点是：

- 保持入口一致
- 保持 scene 数据与 HTML / sitemap 对齐
- 保持人物聊天的前后端逻辑不要漂移
- 改 `api/_lib/` 时 `.ts` / `.js` 两份同步提交

---

## 14. 当前维护状态

截至当前版本（2026-09），这些基础项已经对齐：

- title 风格已统一
- description / og:description / og:image 已统一到关键页面
- `/tools/` 已转为 `/scene/` 兼容入口
- scene 图片已做一轮收口与压缩
- 人物对话页已扩展到 6 个（3 个人物 + 3 个岗位 AI）
- 大恩聚合登录与账号每日限额链路已落地
- `npm run check` 当前通过

因此，这个仓库现在已经适合直接进入下一轮需求开发。
```
