# liutongxue-web

## 当前对外域名

当前正式对外域名：`https://liutongxue.com.cn`

默认公开访问仅保留这一正式域名；仓库内已移除 GitHub Pages 部署路径，也不再把 `vercel.app` / 其他静态出口作为默认公开入口。

## 人物聊天页：真实模型接入说明

当前站点的公开访问方式是：

- 主站页面：`https://liutongxue.com.cn`
- 真实模型 API：同项目下的 `api/chat.ts`

### 1. 前端变量

如果站点与 API 同域部署在 Vercel / 自定义域名下，通常**不需要**额外配置 `VITE_JOBS_CHAT_API_BASE_URL`。

只有在前端静态页面单独部署到其他域名时，才需要显式指定 API 地址，例如：

```bash
VITE_JOBS_CHAT_API_BASE_URL=https://liutongxue.com.cn
```

### 2. Vercel 后端变量

`api/chat.ts` 使用 OpenAI 兼容接口，至少需要：

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
ALLOWED_ORIGINS=https://liutongxue.com.cn,https://www.liutongxue.com.cn,http://localhost:5173
```

如需额外放开预览来源，请显式追加到 `ALLOWED_ORIGINS`；默认仅建议保留正式域名与本地开发地址。

### 3. 本地开发

```bash
npm install
npm run build
```

如果你在本地直接跑 Vite，并且 API 也走本机/同域环境，则不需要配置 `VITE_JOBS_CHAT_API_BASE_URL`。

### 4. 当前行为

- 在 `liutongxue.com.cn` 同域访问时，聊天页默认直接请求当前域名下的 `/api/chat`。
- 如果缺少模型变量或接口不可达，前端会自动回退到演示回复，不会白屏。
