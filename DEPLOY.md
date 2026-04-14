# AI Agent 项目部署指南

## 项目架构

| 层级 | 技术栈 | 部署平台 |
|------|--------|----------|
| 前端 | Modern.js (React) | Vercel |
| 后端 | Express + Node.js | Railway / Render |
| 数据库 | MongoDB | MongoDB Atlas |

---

## 一、准备工作

### 1.1 注册账号
- [Vercel](https://vercel.com) — 前端托管
- [Railway](https://railway.app) 或 [Render](https://render.com) — 后端部署
- [MongoDB Atlas](https://www.mongodb.com/atlas) — 云数据库

### 1.2 需要的密钥
部署前请准备好以下信息：
- **豆包 API Key**（文本模型 + 图片模型）
- **Tavily API Key**（联网搜索）

---

## 二、部署数据库（MongoDB Atlas）

1. 登录 MongoDB Atlas，创建 **Free M0 Cluster**
2. 在 **Database Access** 中创建一个数据库用户（记住用户名和密码）
3. 在 **Network Access** 中点击 **Add IP Address** → **Allow Access from Anywhere**（`0.0.0.0/0`）
4. 进入你的 Cluster，点击 **Connect** → **Drivers** → **Node.js**
5. 复制连接字符串，类似：
   ```
   mongodb+srv://<用户名>:<密码>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
6. 将连接字符串中的数据库名补充好，例如：
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/user_db?retryWrites=true&w=majority
   ```

---

## 三、部署后端（Railway）

### 3.1 创建项目
1. 登录 [Railway](https://railway.app)
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你的 `AI-agent` 仓库
4. 在项目设置中，将 **Root Directory** 设为 `server/`

### 3.2 配置环境变量
进入项目的 **Variables** 标签页，添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | 服务端口（Railway 会自动覆盖） | `3000` |
| `BASE_URL` | 后端公网地址 | `https://ai-agent-api.up.railway.app` |
| `MONGODB_URI` | MongoDB 连接字符串 | `mongodb+srv://...` |
| `DOUBAO_TEXT_API_KEY` | 豆包文本模型 API Key | `c5cc-...` |
| `DOUBAO_IMAGE_API_KEY` | 豆包图片模型 API Key | `982f-...` |
| `DOU_BAO_BASE_URL` | 豆包 Base URL（可选） | `https://ark.cn-beijing.volces.com/api/v3` |
| `DOU_BAO_TEXT_MODEL` | 豆包文本模型名（可选） | `doubao-seed-2-0-code-preview-260215` |
| `DOU_BAO_IMAGE_MODEL` | 豆包图片模型名（可选） | `doubao-seedream-5-0-260128` |
| `TAVILY_API_KEY` | Tavily 搜索 API Key | `tvly-dev-...` |
| `ALLOWED_ORIGINS` | 允许跨域的前端域名 | `https://ai-agent.vercel.app` |

> **注意**：`BASE_URL` 必须是你部署后 Railway 分配的公网域名，否则图片上传后返回的链接会是错误的。

### 3.3 启动服务
Railway 会自动检测 `package.json` 中的 `start` 脚本并运行 `node server.js`。

部署成功后，在 **Settings → Domains** 中可以看到你的后端域名，例如：
```
https://ai-agent-api.up.railway.app
```

---

## 四、部署前端（Vercel）

### 4.1 导入项目
1. 登录 [Vercel](https://vercel.com)
2. 点击 **Add New Project** → 导入 GitHub 仓库 `AI-agent`
3. **Framework Preset** 选择 **Other**（Modern.js 不在预设列表中）

### 4.2 构建设置
| 配置项 | 值 |
|--------|-----|
| Root Directory | `myapp` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 4.3 环境变量
在 Vercel 项目的 **Settings → Environment Variables** 中添加：

| 变量名 | 值 |
|--------|-----|
| `API_BASE_URL` | 你的后端域名，例如 `https://ai-agent-api.up.railway.app` |

### 4.4 重新部署
添加环境变量后，Vercel 会自动重新部署。部署完成后你会获得一个类似以下的域名：
```
https://ai-agent-xxx.vercel.app
```

---

## 五、联调配置

### 5.1 更新后端 CORS
前端部署成功后，将 Vercel 分配的域名添加到后端的 `ALLOWED_ORIGINS` 环境变量中：

```
ALLOWED_ORIGINS=https://ai-agent-xxx.vercel.app
```

如果有多个域名，用英文逗号分隔：
```
ALLOWED_ORIGINS=https://ai-agent-xxx.vercel.app,http://localhost:8080
```

修改后 Railway 会自动重新部署后端。

### 5.2 验证功能
打开前端页面，测试以下功能：
- [ ] 正常发送消息
- [ ] SSE 流式返回正常
- [ ] 图片上传成功，且返回的图片链接可访问
- [ ] 联网搜索功能正常
- [ ] 历史记录加载和删除正常

---

## 六、Render 部署后端（Railway 备选）

如果你选择 [Render](https://render.com) 而不是 Railway：

1. 登录 Render，点击 **New Web Service**
2. 连接 GitHub 仓库
3. 配置如下：
   - **Name**: `ai-agent-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. 在 **Environment** 标签页添加和 Railway 相同的环境变量
5. 部署完成后获得域名，例如 `https://ai-agent-api.onrender.com`

> Render 免费实例会在 15 分钟无活动后休眠，首次访问可能需要等待 30 秒唤醒。

---

## 七、本地开发

### 后端
```bash
cd server
npm install

# Linux/Mac
export DOUBAO_TEXT_API_KEY=xxx
export DOUBAO_IMAGE_API_KEY=xxx
export TAVILY_API_KEY=xxx
export MONGODB_URI=mongodb://127.0.0.1:27017
npm start

# Windows PowerShell
$env:DOUBAO_TEXT_API_KEY="xxx"
$env:DOUBAO_IMAGE_API_KEY="xxx"
$env:TAVILY_API_KEY="xxx"
$env:MONGODB_URI="mongodb://127.0.0.1:27017"
npm start
```

### 前端
```bash
cd myapp
npm install
npm run dev
```
前端默认访问 `http://localhost:8080`，后端在 `http://localhost:3000`。

---

## 八、常见问题

### Q1: 前端请求后端报 CORS 错误
**A**: 检查后端 `ALLOWED_ORIGINS` 是否包含了前端的真实域名（包括 `https://` 协议头）。

### Q2: 图片上传成功但无法显示
**A**: 检查后端 `BASE_URL` 环境变量是否设置为后端的公网域名。如果还是 `localhost:3000`，图片链接就是错的。

### Q3: Railway/Render 启动失败，提示缺少 API Key
**A**: 检查环境变量 `DOUBAO_TEXT_API_KEY`、`DOUBAO_IMAGE_API_KEY`、`TAVILY_API_KEY` 是否都已正确配置。

### Q4: MongoDB 连接失败
**A**: 
- 确认 `MONGODB_URI` 格式正确
- 确认 Atlas 的 **Network Access** 允许了 `0.0.0.0/0`
- 确认用户名和密码正确，且密码中的特殊字符已进行 URL 编码

---

## 九、文件改动说明

本次改造涉及以下文件：
- `server/server.js` — 环境变量化所有配置
- `server/api/db.js` — 环境变量化 MongoDB URI
- `server/package.json` — 添加 `start` 脚本和 `engines`
- `myapp/src/api/config.ts` — 新增 API 基础 URL 配置
- `myapp/src/api/lambda/data.ts` — 替换硬编码 API 地址
- `myapp/src/api/lambda/upload.ts` — 替换硬编码 API 地址
- `myapp/src/routes/component/SideBar/SideBar.tsx` — 替换硬编码 API 地址
