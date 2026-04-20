# liutongxue-web

> liutongxue.com.cn 的前端仓库。  
> 这是一个 **多入口静态站点 + Vercel Serverless 聊天接口** 的组合项目。  
> 如果以后把这个项目交给另一个 AI 或开发者，建议优先按 **路由入口 → React 页面 → 文案/数据源 → SEO/静态资源 → 校验命令** 这条链路理解。

## 1. 项目简介

当前站点主要包含 3 类内容：

- 首页 `/`：站点主视觉、核心模块、联系区
- 人物页 `/figures/`，以及当前已落地的 3 个具体人物对话页
- Scene 页 `/scene/`，以及当前已落地的 3 个日志集合页、13 个日志详情页

项目以稳定维护和发布展示型站点为主；人物聊天链路同时保留后端模型接口与前端 fallback 演示回复，用于接口异常或未接通时兜底。

### 当前正式域名

- `https://www.liutongxue.com.cn`

默认公开访问以这个正式域名为准。

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

### 维护上要先知道的事

- 这个项目更接近 **MPA（多页面应用）**，不是典型 SPA
- 很多 SEO 信息写在各自路由的 `index.html` 里
- Scene 详情页正文不是 CMS，而是直接写在 `src/data/scene/*.ts`
- 人物聊天同时存在“后端模型接口链路”和“前端 fallback 演示链路”；涉及人物设定、回复策略或相关文案时，需要同时检查两条链路是否保持一致

---

## 3. 目录结构

```text
.
├─ api/
│  └─ chat.ts                         # 人物聊天接口（Serverless）
├─ public/
│  ├─ robots.txt
│  ├─ sitemap.xml
│  └─ scene/.../cover.webp            # Scene 详情页配图
├─ src/
│  ├─ assets/
│  │  ├─ hero.webp
│  │  ├─ contact/
│  │  └─ figures/
│  ├─ components/                     # 首页/全站通用组件
│  ├─ constants/                      # 首页文案常量
│  ├─ data/scene/                     # Scene 列表与详情页数据源
│  ├─ features/figure-chat/           # 人物聊天前端逻辑
│  ├─ pages/                          # 页面组件
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
├─ vite.config.ts                     # 多入口构建 + canonical / OG 注入
├─ .env.example
└─ tools/smoke-check.mjs              # 路由 / sitemap / API 健康检查
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
| `/scene/` | `scene/index.html` | `src/scene.tsx` | `src/pages/ScenePage.tsx` |
| `/scene/digital-resident/` | `scene/digital-resident/index.html` | `src/sceneLogCollection.tsx` | `src/data/scene/digital-resident.ts` |
| `/scene/blog-ops/` | `scene/blog-ops/index.html` | `src/sceneLogCollection.tsx` | `src/data/scene/blog-ops.ts` |
| `/scene/site-ops/` | `scene/site-ops/index.html` | `src/sceneLogCollection.tsx` | `src/data/scene/site-ops.ts` |
| `/scene/.../YYYY-MM-DD/` | 各详情页 `index.html` | `src/sceneLogDetail.tsx` | 对应 `src/data/scene/*.ts` 中的 `detailContent` |
| `/tools/` | `tools/index.html` | 无 React 页面 | 纯跳转到 `/scene/` |

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

- `figures/steve-jobs/index.html`
- `figures/elon-musk/index.html`
- `figures/zhang-yiming/index.html`

这里分别维护：

- `<title>`
- `<meta name="description">`

### 人物回复策略相关逻辑在哪里改

前端 fallback 演示回复逻辑：

- `src/features/figure-chat/core.ts`

后端模型接口中的人物提示词与回复规则：

- `api/chat.ts`

> 维护原则：  
> 这两个文件分别承载前端兜底链路与后端接口链路的人物逻辑。  
> 如果修改人物设定、回复规则或 fallback 行为，需要同时核对两处实现，避免在线接口返回与前端兜底返回出现明显漂移。

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

- `public/scene/**/cover.webp`

例如：

- `public/scene/blog-ops/2026-03-13/cover.webp`
- `public/scene/digital-resident/2026-03-21/cover.webp`
- `public/scene/site-ops/2026-04-01/cover.webp`

并且数据文件里通过 `detailImageSrc` 指向对应路径。

> 这类图片路径要和路由严格对齐，不能只改图片文件不改数据，或只改数据不改文件。

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

同时，头部导航中的“具身AI”在 `src/components/SiteHeader.tsx` 中仍为禁用态占位项，尚未配置可访问的正式入口。

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

每个路由自己的 HTML 入口文件里改，例如：

- `index.html`
- `figures/index.html`
- `figures/**/*.html`
- `scene/index.html`
- `scene/**/*.html`
- `tools/index.html`

也就是说，**title 和 meta description 不是集中在 React 组件里改，而是主要在每个 HTML 文件里改。**

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

注入所依赖的数据来源：

- 当前 HTML 文件里的 `<title>`
- 当前 HTML 文件里的 `<meta name="description">`

### `/tools/` 的 canonical 特殊逻辑

- `vite.config.ts`
  - `canonicalPathOverrides`

当前把：

- `/tools/` canonical 到 `/scene/`

因为 `/tools/` 现在只是兼容旧入口，不再作为独立内容页维护。

> 当前没有统一注入 `og:image` 的逻辑。  
> 如果后续要补分享图，需要在 `vite.config.ts` 或各页面 HTML 里单独扩展。

---

## 8. sitemap / route / tools 跳转相关

### sitemap

- `public/sitemap.xml`

当前是手工维护。

### robots

- `public/robots.txt`

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

适合 scene 详情页封面这类希望按固定 URL 暴露的资源：

- `public/scene/**/cover.webp`
- `public/robots.txt`
- `public/sitemap.xml`

### 构建产物

- `dist/`

---

## 10. 人物聊天接入说明

当前公开访问方式：

- 主站页面：`https://www.liutongxue.com.cn`
- 真实模型 API：同项目下的 `api/chat.ts`

### 前端变量

如果前端页面与 `/api/chat` 同域部署在 Vercel 或自定义域名下，通常**不需要**额外配置 `VITE_JOBS_CHAT_API_BASE_URL`。

只有在前端静态页面与聊天接口分域部署时，才需要显式指定 API 基地址，例如：

```bash
VITE_JOBS_CHAT_API_BASE_URL=https://www.liutongxue.com.cn
```

说明：变量名中的 `JOBS` 为历史命名，当前实际用于人物聊天接口基地址配置。

### 后端变量

`api/chat.ts` 使用 OpenAI 兼容接口，至少需要：

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
ALLOWED_ORIGINS=https://www.liutongxue.com.cn,https://liutongxue.com.cn,http://localhost:5173
```

如需额外放开预览来源，请显式追加到 `ALLOWED_ORIGINS`。

### 当前行为

- 同域访问时，聊天页默认请求当前域名下的 `/api/chat`
- 如果缺少模型变量或接口不可达，前端会自动回退到演示回复
- 如果后端函数加载失败，前端会显示未连接或 fallback 状态

---

## 11. 高风险 / 不要轻易乱动的区域

以下区域属于高风险变更点；除非需求明确，否则不建议进行顺手重构或结构性调整：

### 1) `api/chat.ts`

原因：

- 人物聊天真实模型接入入口
- 涉及 CORS、fallback、Serverless 运行时
- 改坏会直接影响线上聊天可用性

### 2) `src/features/figure-chat/core.ts`

原因：

- 同时承载人物 system prompt、直出规则、mock 逻辑
- 轻微改动就会显著改变角色口吻与稳定性

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
- 修改 scene 数据和图片路径

推荐最小检查清单：

1. `npm run check`
2. 打开首页 `/`
3. 打开至少 1 个人物页
4. 打开至少 1 个 scene 集合页
5. 打开至少 1 个 scene 详情页
6. 如果碰了聊天逻辑，再检查 `/api/chat`

---

## 13. 交接建议

如果以后交给另一个 AI 或开发者继续维护，建议这样理解这个项目：

1. 先看 `README`
2. 再看 `src/site.ts`，理解全站路径
3. 再看 `vite.config.ts`，理解多入口与 SEO 注入
4. 再看 `src/pages/*` 与 `src/data/scene/*`
5. 最后再碰 `features/figure-chat/*` 和 `api/chat.ts`

优先做 **小范围精确修改**，不要上来就尝试把它重构成另一套架构。

当前这套站已经稳定跑通，维护重点是：

- 保持入口一致
- 保持 scene 数据与 HTML / sitemap 对齐
- 保持人物聊天的前后端逻辑不要漂移

---

## 14. 当前维护状态

截至当前版本，这些基础项已经对齐：

- title 风格已统一
- description / og:description 已统一到关键页面
- `/tools/` 已转为 `/scene/` 兼容入口
- scene 图片已做一轮收口与压缩
- `npm run check` 当前通过

因此，这个仓库现在已经适合直接进入下一轮需求开发。
```
