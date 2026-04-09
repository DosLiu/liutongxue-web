# liutongxue-web

## 与虚拟乔布斯对话：真实模型接入说明

当前仓库采用“两段式”部署：

- 主站静态页面：GitHub Pages
- 真实模型 API：Vercel `api/chat.ts`

### 1. 前端变量（GitHub Pages 构建时）

如果聊天页继续放在 GitHub Pages，需要把前端请求指到 Vercel 域名：

```bash
VITE_JOBS_CHAT_API_BASE_URL=https://your-vercel-domain.vercel.app
```

### 2. Vercel 后端变量

`api/chat.ts` 使用 OpenAI 兼容接口，至少需要：

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
ALLOWED_ORIGINS=https://dosliu.github.io,https://your-vercel-domain.vercel.app,http://localhost:5173
```

### 3. 本地开发

```bash
npm install
npm run build
```

如果你在本地直接跑 Vite，并且 API 也走本机/同域环境，则不需要配置 `VITE_JOBS_CHAT_API_BASE_URL`。

### 4. 当前行为

- 配好前端 API 地址 + Vercel 模型变量后，聊天页会直接走真实模型。
- 如果缺少变量或接口不可达，前端会自动回退到演示回复，不会白屏。
