# 双币理财看板

双币理财收益追踪与分析系统

## 功能特性

- ✅ 支持 BTC 和 ETH 双币理财
- ✅ 支持币安和欧易两个平台
- ✅ 低买（看跌）和高卖（看涨）两种方向
- ✅ 实时价格监控（来自 CoinMarketCap）
- ✅ 自动结算到期交易
- ✅ 净值实时计算
- ✅ 收益统计和分析
- ✅ 复投链条追踪

## 技术栈

- **前端**: React + Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Railway)
- **定时任务**: Cron job 每 5 分钟
- **价格数据**: CoinMarketCap API
- **部署**: Railway

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/zhaoyidemo/option.git
cd option
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并填写：

```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
CMC_API_KEY="your_cmc_api_key_here"
NODE_ENV="development"
```

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## Railway 部署

### 1. 创建 Railway 项目

1. 访问 [Railway.app](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `zhaoyidemo/option` 仓库

### 2. 添加 PostgreSQL 数据库

1. 在项目中点击 "New"
2. 选择 "Database" → "PostgreSQL"
3. 等待数据库创建完成
4. 复制 `DATABASE_URL` 环境变量

### 3. 配置环境变量

在项目设置中添加以下环境变量：

```
DATABASE_URL=<从 PostgreSQL 复制>
CMC_API_KEY=f84ec6492a124494bd4352afcb65cd9d
NODE_ENV=production
```

### 4. 部署应用

Railway 会自动检测 Next.js 应用并部署。

### 5. 配置定时任务

#### 方式一：使用 Railway Cron（推荐）

在 Railway 项目设置中：
1. 点击 "Deployments" → "Settings"
2. 找到 "Cron Jobs" 部分
3. 添加任务：
   - **Schedule**: `*/5 * * * *` (每 5 分钟)
   - **Command**: `curl https://your-app.railway.app/api/cron`

#### 方式二：使用外部 Cron 服务

使用 [cron-job.org](https://cron-job.org) 或 [EasyCron](https://www.easycron.com)：
1. 创建新任务
2. URL: `https://your-app.railway.app/api/cron`
3. 间隔: 每 5 分钟

## 使用说明

### 1. 配置初始资产

首次使用时，点击"资产配置"按钮，设置你的初始 USDT、BTC、ETH 数量。

### 2. 创建交易

点击"新建交易"，填写：
- 平台（币安/欧易）
- 币种（BTC/ETH）
- 方向（低买/高卖）
- 投入数量
- 行权价
- 到期时间
- 年化收益率
- 预期结果（未行权收益、行权得到数量）

### 3. 自动结算

系统会在到期时间到达后，自动：
1. 获取 CMC 价格
2. 判断是否行权
3. 计算实际收益
4. 更新净值

### 4. 查看统计

首页展示：
- 实时 BTC/ETH 价格
- 总净值（USDT + BTC + ETH）
- 累计收益和收益率
- 按平台的收益统计

## 数据结构

### 交易状态流转

```
pending (待结算) → settled (已结算)
```

### 行权判断逻辑

**低买（看跌期权）**:
- 价格 < 行权价 → 行权（得币）
- 价格 >= 行权价 → 不行权（得 USDT + 收益）

**高卖（看涨期权）**:
- 价格 > 行权价 → 行权（得 USDT）
- 价格 <= 行权价 → 不行权（得币 + 收益）

## 开发

### 数据库迁移

```bash
# 创建新迁移
npx prisma migrate dev --name your_migration_name

# 重置数据库
npx prisma migrate reset

# 查看数据库
npx prisma studio
```

### 构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## API 端点

- `GET /api/trades` - 获取所有交易
- `POST /api/trades` - 创建新交易
- `DELETE /api/trades?id=xxx` - 删除交易
- `GET /api/assets` - 获取资产
- `POST /api/assets` - 更新资产
- `GET /api/price` - 获取实时价格
- `GET /api/stats` - 获取统计数据
- `POST /api/settle` - 手动触发结算
- `GET /api/cron` - Cron 定时结算

## 许可证

MIT
