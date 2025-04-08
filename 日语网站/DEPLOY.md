# 部署指南

## 系统要求

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本
- Cloudflare 账户（用于部署 Workers 和 D1 数据库）

## 本地开发环境设置

1. 克隆代码库
```bash
git clone https://github.com/your-username/anime-nihongo-daily.git
cd anime-nihongo-daily
```

2. 安装依赖
```bash
npm install
```

3. 设置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，填写必要的环境变量
```

4. 初始化本地数据库
```bash
npx wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

5. 启动开发服务器
```bash
npm run dev
```

## 构建生产版本

```bash
npm run build
```

构建完成后，生产文件将位于 `.next` 目录中。

## 部署到 Cloudflare Workers

### 首次部署

1. 登录 Cloudflare
```bash
npx wrangler login
```

2. 创建 D1 数据库
```bash
npx wrangler d1 create anime_nihongo_daily
# 记下返回的数据库 ID，并更新 wrangler.toml 文件中的 database_id
```

3. 应用数据库迁移
```bash
npx wrangler d1 migrations apply DB
```

4. 部署应用
```bash
npm run deploy
```

### 更新已部署的应用

1. 构建最新版本
```bash
npm run build
```

2. 应用数据库迁移（如果有新的迁移）
```bash
npx wrangler d1 migrations apply DB
```

3. 部署更新
```bash
npm run deploy
```

## 自定义域名设置

1. 在 Cloudflare 控制面板中添加您的域名
2. 创建 CNAME 记录，指向您的 Workers 应用
3. 在 Workers 设置中配置自定义域名

## 监控和日志

- 访问 Cloudflare Workers 控制面板查看应用性能和日志
- 使用 `wrangler tail` 命令实时查看日志：
```bash
npx wrangler tail
```

## 故障排除

### 常见问题

1. **部署失败**
   - 检查 wrangler.toml 配置是否正确
   - 确保 Cloudflare 账户有足够的权限

2. **数据库迁移错误**
   - 检查 SQL 语法
   - 确保数据库 ID 配置正确

3. **应用加载缓慢**
   - 检查资源大小和加载顺序
   - 考虑启用更多的缓存策略

### 获取帮助

如有问题，请联系项目维护者或提交 GitHub issue。
