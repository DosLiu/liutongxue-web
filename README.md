# liutongxue-web

Liutongxue 项目展示站。使用 Vite、React、TypeScript 和 Three.js，包含首页、案发现场、硅基同事和七个角色对话页。Vercel 承载正式站和聊天 API，GitHub Pages 提供静态镜像。

[访问正式站](https://ai.liutongxue.com.cn/) · [访问 GitHub Pages 镜像](https://dosliu.github.io/liutongxue-web/) · [维护指南](docs/maintenance.md)

## 快速开始

使用 Node.js 24，与仓库的 GitHub Actions 配置一致。

```bash
npm ci
npm run dev
```

打开终端显示的本地地址即可查看前端。默认的本地构建和 GitHub Pages 镜像支持静态浏览与演示回复，真实对话需要可用的 Serverless 聊天 API。

| 命令 | 用途 |
| --- | --- |
| `npm run build` | 执行 TypeScript 检查，生成 `dist/` |
| `npm run preview` | 本地预览 `dist/` |
| `npm run check` | 构建并检查路由、SEO、聊天接口、数字分身资料和额度逻辑 |

## 配置真实对话

正式站在 Vercel 的项目环境变量中配置模型和 Redis。数字分身还需要读取资料仓库的权限。变量示例见 [.env.example](.env.example)。

| 用途 | 配置 |
| --- | --- |
| 模型服务 | `OPENAI_API_KEY`。使用自定义接口或模型时，再设置 `OPENAI_BASE_URL` 和 `OPENAI_MODEL`。 |
| 游客身份 | `AUTH_SESSION_SECRET`，至少 32 个字符，用于签名身份 Cookie。 |
| 游客额度 | `AUTH_KV_ENABLED=true`、`KV_REST_API_URL`、`KV_REST_API_TOKEN`。使用同一个 Redis 库的 REST 地址与读写令牌。 |
| 数字分身资料 | `DIGITAL_HUMAN_GITHUB_TOKEN`，使用可读取资料仓库内容的令牌。 |

站内对话页默认请求同域 `/api/chat`。需要连接另一个 API 地址时，可设置 `VITE_JOBS_CHAT_API_BASE_URL` 或 `VITE_CHAT_API_URL`，并配置服务端的 `ALLOWED_ORIGINS`。`VITE_` 变量用于可公开的前端配置，模型、GitHub、Redis 和身份签名密钥放在服务端环境中。

访客每天有 5 次真实对话体验，七个角色共享额度，北京时间 0 点重置。当前登录默认关闭，准备恢复登录时可查阅[维护指南](docs/maintenance.md#接口与访客额度)。

## 项目目录

| 路径 | 维护内容 |
| --- | --- |
| [index.html](index.html)、[figures/](figures/)、[scene/](scene/) | 各页面的 HTML 入口，Vite 按实际路径构建。 |
| [src/pages/](src/pages/)、[src/components/](src/components/) | 页面、共用组件和动效。 |
| [src/site.ts](src/site.ts) | 站内路径、导航和联系区链接。 |
| [src/figure-chat.tsx](src/figure-chat.tsx)、[src/features/figure-chat/](src/features/figure-chat/) | 七个角色页的共用启动入口、界面配置和请求逻辑。 |
| [api/](api/) | 聊天与登录接口。共享运行逻辑位于 `api/_lib/*.js`，类型声明位于同名 `.d.ts`。 |
| [src/data/scene/](src/data/scene/) | 工作日志的路由、摘要、正文和封面映射。 |
| [public/](public/)、[design/og/](design/og/) | 发布用的站点地图、分享图等资源，以及独立保存的分享图设计源稿。 |
| [tools/](tools/) | 构建、路由和接口的检查脚本，以及旧 `/tools/` 本地跳转页。 |

工作日志入口当前处于整理状态。旧地址展示「AI 工作日志正在整理」，并保留在站点地图中。新增角色、编辑日志和恢复入口的步骤见[维护指南](docs/maintenance.md)。

## 验证与发布

提交前先运行 `npm run check`，再用 `npm run preview` 检查改动页面。项目以本地预览验收，`test` 分支用于留档，验收通过后合入 `main`。

- **Vercel 正式站**使用根路径部署页面及 `api/` 函数。正式地址为 `https://ai.liutongxue.com.cn/`。
- **GitHub Pages 镜像**使用 `/liutongxue-web/` 子路径。仓库工作流在推送 `main` 或手动触发时构建并发布镜像，镜像带 `noindex`，canonical 指向正式站。 [发布工作流](.github/workflows/deploy-pages.yml)
