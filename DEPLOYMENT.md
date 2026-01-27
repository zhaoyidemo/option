# Railway 部署指南

## 步骤 1: 准备 GitHub 仓库

✅ 已完成 - 代码已推送到 https://github.com/zhaoyidemo/option

## 步骤 2: 在 Railway 创建项目

1. 访问 https://railway.app
2. 使用 GitHub 账号登录
3. 点击 **"New Project"**
4. 选择 **"Deploy from GitHub repo"**
5. 授权 Railway 访问你的 GitHub
6. 选择 `zhaoyidemo/option` 仓库

## 步骤 3: 添加 PostgreSQL 数据库

1. 在项目页面，点击 **"New"** → **"Database"** → **"Add PostgreSQL"**
2. 等待数据库创建完成（约 1-2 分钟）
3. 数据库创建后，Railway 会自动生成连接信息

## 步骤 4: 配置环境变量

### 方法 A: 在 Web UI 配置

1. 点击你的应用服务（不是数据库）
2. 进入 **"Variables"** 标签
3. 点击 **"New Variable"** 添加以下变量：

```
CMC_API_KEY = f84ec6492a124494bd4352afcb65cd9d
NODE_ENV = production
```

> **注意**: `DATABASE_URL` 会自动从 PostgreSQL 服务链接，无需手动添加

### 方法 B: 使用 Railway CLI

```bash
railway variables set CMC_API_KEY=f84ec6492a124494bd4352afcb65cd9d
railway variables set NODE_ENV=production
```

## 步骤 5: 初始化数据库

部署完成后，需要运行数据库迁移：

### 方法 A: 在 Railway 控制台

1. 进入应用服务页面
2. 点击 **"Deployments"**
3. 找到最新的部署，点击 **"View Logs"**
4. 点击右上角三个点 → **"Run command"**
5. 输入命令：

```bash
npx prisma migrate deploy
```

### 方法 B: 使用 Railway CLI

```bash
railway run npx prisma migrate deploy
```

## 步骤 6: 配置定时任务（自动结算）

### 选项 A: 使用 Cron-job.org（推荐，免费）

1. 访问 https://cron-job.org 并注册
2. 创建新的 Cron Job：
   - **URL**: `https://your-app.railway.app/api/cron`
   - **Schedule**: `*/5 * * * *`（每 5 分钟）
   - **Title**: "Option Settlement"
3. 保存并启用

### 选项 B: 使用 EasyCron

1. 访问 https://www.easycron.com 并注册
2. 创建新的 Cron Job：
   - **URL**: `https://your-app.railway.app/api/cron`
   - **Interval**: Every 5 minutes
3. 保存并启用

### 选项 C: 使用 GitHub Actions（免费）

在仓库中创建 `.github/workflows/cron.yml`：

```yaml
name: Settlement Cron
on:
  schedule:
    - cron: '*/5 * * * *'  # 每 5 分钟
  workflow_dispatch:  # 手动触发

jobs:
  settle:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger settlement
        run: curl https://your-app.railway.app/api/cron
```

## 步骤 7: 验证部署

1. 获取应用 URL（在 Railway 项目页面的 **"Settings"** → **"Domains"**）
2. 访问 URL，应该能看到双币理财看板
3. 点击 **"资产配置"**，设置初始资产
4. 点击 **"新建交易"**，创建测试交易
5. 检查实时价格是否正常显示

## 步骤 8: 测试定时任务

手动触发一次结算测试：

```bash
curl https://your-app.railway.app/api/cron
```

应该返回：

```json
{
  "success": true,
  "timestamp": "2024-01-15T08:00:00.000Z",
  "settled": 0,
  "results": []
}
```

## 常见问题

### Q1: 部署失败，提示 "Build failed"

**解决方案**:
- 检查 Railway 日志中的错误信息
- 确保所有依赖都在 `package.json` 中
- 尝试在本地运行 `npm run build` 检查是否有错误

### Q2: 数据库连接失败

**解决方案**:
- 确保 PostgreSQL 服务已创建
- 检查 `DATABASE_URL` 环境变量是否正确
- 在 Railway 中重新部署应用

### Q3: 价格无法获取

**解决方案**:
- 检查 `CMC_API_KEY` 环境变量是否正确
- 访问 https://coinmarketcap.com/api/ 检查 API 额度
- 查看应用日志中的错误信息

### Q4: 定时任务不执行

**解决方案**:
- 手动访问 `/api/cron` 端点测试
- 检查 cron 服务是否正确配置
- 查看 cron 服务的执行日志

### Q5: 如何查看日志

在 Railway 控制台：
1. 进入应用服务
2. 点击 **"Deployments"**
3. 选择最新部署
4. 点击 **"View Logs"**

## 更新应用

当你更新代码后：

1. 推送到 GitHub：
   ```bash
   git add .
   git commit -m "Update: xxx"
   git push
   ```

2. Railway 会自动检测并重新部署

## 数据备份

定期备份数据库：

```bash
# 使用 Railway CLI
railway run pg_dump > backup.sql
```

## 监控和维护

- **监控价格**: 定期检查实时价格是否正常
- **检查结算**: 查看已结算交易是否正确
- **API 额度**: 注意 CMC API 的月度调用限制（免费版 10,000 次）

## 支持

如有问题，请在 GitHub 仓库提 Issue：
https://github.com/zhaoyidemo/option/issues
