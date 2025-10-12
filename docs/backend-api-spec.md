# 黄河项目后端 API 开发文档

## 目录
- [概述](#概述)
- [认证机制](#认证机制)
- [核心接口](#核心接口)
- [数据分析接口](#数据分析接口)
- [数据结构定义](#数据结构定义)
- [实现建议](#实现建议)

---

## 概述

本文档定义了黄河 CSGO 饰品交易监控系统的后端 API 规范。系统主要功能包括：
- 用户认证与权限管理
- 项目（监控任务）的 CRUD 操作
- 饰品交易数据的采集与分析
- 实时数据展示与历史趋势分析

**技术栈建议：**
- Python 3.9+ / Flask or FastAPI
- PostgreSQL / MySQL 数据库
- Redis 缓存
- Celery 定时任务

**基础 URL：** `http://localhost:5001`

---

## 认证机制

### JWT Token 认证

所有受保护的接口都需要在请求头中携带 JWT token：

```http
Authorization: Bearer <jwt_token>
```

**Token 有效期：** 24 小时  
**刷新机制：** 建议实现 refresh token 机制（可选）

---

## 核心接口

### 1. 用户认证

#### 1.1 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "invite_code": "string (optional)"
}
```

**响应 201 Created：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "test_user",
    "role": "teacher",
    "permissions": ["view_projects", "create_project"],
    "created_at": "2025-10-13T08:00:00Z"
  }
}
```

#### 1.2 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应 200 OK：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "test_user",
    "role": "teacher",
    "permissions": ["view_projects", "create_project"]
  }
}
```

---

### 2. 项目管理

#### 2.1 获取项目列表
```http
GET /api/projects
Authorization: Bearer <token>
```

**响应 200 OK：**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "QT1",
      "template_id": 49082,
      "owner_id": 7,
      "is_active": true,
      "member_level_required": null,
      "created_at": "2025-10-12T23:37:31.895517",
      "item": {
        "market_name": "AK-47 | 火蛇 (崭新出厂)",
        "market_hash_name": "AK-47 | Fire Serpent (Factory New)",
        "weapon": "AK-47",
        "exterior": "崭新出厂",
        "quality": "普通",
        "rarity": "隐秘",
        "type": "步枪",
        "color": "eb4b4b",
        "item_set": "英勇收藏品",
        "icon_url": "https://youpin.img898.com/economy/image/0380f764614e11ecb073acde48001122",
        "buff": "33895",
        "uu": "49082",
        "c5": "26664",
        "igxe": "4287"
      }
    }
  ]
}
```

**说明：**
- 返回当前用户有权限查看的所有项目
- `item` 字段包含饰品的详细信息（从爬虫数据中获取）
- `is_active` 表示项目是否启动中

#### 2.2 获取项目详情
```http
GET /api/projects/{project_id}
Authorization: Bearer <token>
```

**响应 200 OK：**
```json
{
  "id": 1,
  "name": "QT1",
  "template_id": 49082,
  "owner_id": 7,
  "is_active": true,
  "member_level_required": null,
  "created_at": "2025-10-12T23:37:31.895517",
  "item": {
    "market_name": "AK-47 | 火蛇 (崭新出厂)",
    "weapon": "AK-47",
    "exterior": "崭新出厂",
    "rarity": "隐秘",
    "icon_url": "https://youpin.img898.com/economy/image/..."
  }
}
```

#### 2.3 创建项目
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "template_id": 49082,
  "member_level_required": "core (optional)"
}
```

**响应 201 Created：**
```json
{
  "project": {
    "id": 8,
    "name": "New Project",
    "template_id": 49082,
    "owner_id": 7,
    "is_active": true,
    "created_at": "2025-10-13T08:30:00Z"
  }
}
```

#### 2.4 更新项目
```http
PUT /api/projects/{project_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string (optional)",
  "is_active": true/false (optional),
  "template_id": 49082 (optional)
}
```

#### 2.5 删除项目
```http
DELETE /api/projects/{project_id}
Authorization: Bearer <token>
```

**响应 200 OK：**
```json
{
  "deleted": true
}
```

---

## 数据分析接口

### 3. 项目分析数据（核心接口）

#### 3.1 获取项目分析数据
```http
GET /api/projects/{project_id}/analysis?timeRange=24
Authorization: Bearer <token>
```

**查询参数：**
- `timeRange`: 时间范围（小时），可选值：12, 24, 48, 72，默认 24

**响应 200 OK：**
```json
{
  "project": {
    "id": 1,
    "name": "QT1",
    "template_id": 49082,
    "is_active": true,
    "created_at": "2025-10-12T23:37:31.895517",
    "item": {
      "market_name": "AK-47 | 火蛇 (崭新出厂)",
      "weapon": "AK-47",
      "exterior": "崭新出厂",
      "icon_url": "https://..."
    }
  },
  "analysis": {
    "timeRange": 24,
    "timestamp": "2025-10-13T08:30:00Z",
    "topBuyers": [
      {
        "userId": "user_1001",
        "userName": "玩家A",
        "avatarUrl": "/logo.ico",
        "orderCount": 156,
        "timestamp": 1728806400000,
        "position": 1
      }
    ],
    "buyerPositionDistribution": [
      {
        "userId": "user_1001",
        "userName": "玩家A",
        "positions": [
          { "position": 1, "count": 18 },
          { "position": 2, "count": 4 }
        ],
        "totalOrders": 24
      }
    ],
    "topSellers": [
      {
        "userId": "user_1034",
        "userName": "玩家D",
        "avatarUrl": "/logo.ico",
        "listingCount": 89,
        "timestamp": 1728806400000
      }
    ],
    "topBuyers_transactions": [
      {
        "userId": "user_1012",
        "userName": "玩家G",
        "avatarUrl": "/logo.ico",
        "buyCount": 45,
        "sellCount": 12,
        "totalCount": 57
      }
    ],
    "topSellers_transactions": [
      {
        "userId": "user_1067",
        "userName": "玩家I",
        "avatarUrl": "/logo.ico",
        "buyCount": 8,
        "sellCount": 52,
        "totalCount": 60
      }
    ],
    "activePairs": [
      {
        "user1Id": "user_1012",
        "user1Name": "玩家G",
        "user2Id": "user_1067",
        "user2Name": "玩家I",
        "user1BoughtFromUser2": 15,
        "user2BoughtFromUser1": 3,
        "totalTransactions": 18
      }
    ]
  },
  "statistics": {
    "totalBuyOrders": 2847,
    "totalSellListings": 1923,
    "totalTransactions": 856,
    "activeBuyers": 156,
    "activeSellers": 98,
    "avgPrice": 34523.75,
    "maxPrice": 36500.00,
    "minPrice": 33000.00,
    "priceChange24h": 2.3
  }
}
```

**字段说明：**

1. **topBuyers** (Array[30])：求购榜
   - 在时间范围内求购次数最多的用户（前30名）
   - `orderCount`: 求购总次数
   - `position`: 当前位次（1-30）

2. **buyerPositionDistribution** (Array[10])：位次分布
   - 频繁求购者在求购榜中的位置分布（前10名）
   - 用于分析用户的求购活跃度和竞争力
   - `positions`: 位次分布数组，每个元素包含 position（位次）和 count（出现次数）

3. **topSellers** (Array[30])：在售榜
   - 挂售次数最多的用户（前30名）
   - `listingCount`: 挂售总次数

4. **topBuyers_transactions** (Array[20])：成交买入榜
   - 实际成交买入次数最多的用户（前20名）
   - `buyCount`: 买入次数
   - `sellCount`: 卖出次数
   - `totalCount`: 总交易次数

5. **topSellers_transactions** (Array[20])：成交卖出榜
   - 实际成交卖出次数最多的用户（前20名）

6. **activePairs** (Array[20])：活跃交易对
   - 互相交易频繁的用户对（前20对）
   - `user1BoughtFromUser2`: user1 从 user2 买入次数
   - `user2BoughtFromUser1`: user2 从 user1 买入次数
   - `totalTransactions`: 总交易次数

---

### 4. 历史数据接口（可选）

#### 4.1 获取每小时数据
```http
GET /api/projects/{project_id}/hourly?hours=72
Authorization: Bearer <token>
```

**响应 200 OK：**
```json
{
  "hourlyData": [
    {
      "timestamp": 1728720000000,
      "buyOrders": [
        {
          "userId": "user_1001",
          "userName": "玩家A",
          "orderCount": 8,
          "position": 1
        }
      ],
      "sellListings": [
        {
          "userId": "user_1034",
          "userName": "玩家D",
          "listingCount": 5
        }
      ],
      "transactions": [
        {
          "transactionId": "tx_1728720000000_0",
          "buyerId": "user_1012",
          "sellerId": "user_1067",
          "price": 34500.50,
          "timestamp": 1728720123000
        }
      ]
    }
  ]
}
```

---

## 数据结构定义

### User（用户）
```typescript
{
  id: number,
  username: string,
  role: "admin" | "teacher" | "student",
  permissions: string[],
  created_at: string (ISO 8601),
  project_quota?: number
}
```

### Project（项目）
```typescript
{
  id: number,
  name: string,
  template_id: number,
  owner_id: number,
  is_active: boolean,
  member_level_required?: string,
  created_at: string (ISO 8601),
  item: ItemInfo
}
```

### ItemInfo（饰品信息）
```typescript
{
  market_name: string,           // 中文名称
  market_hash_name: string,      // 英文名称
  weapon: string,                // 武器类型
  exterior: string,              // 外观
  quality: string,               // 品质
  rarity: string,                // 稀有度
  type: string,                  // 类型
  color: string,                 // 颜色代码
  item_set: string,              // 系列
  icon_url: string,              // 图标 URL
  buff: string,                  // Buff 平台 ID
  uu: string,                    // 悠悠平台 ID
  c5: string,                    // C5GAME 平台 ID
  igxe: string                   // IGXE 平台 ID
}
```

### BuyOrder（求购数据）
```typescript
{
  userId: string,
  userName: string,
  avatarUrl?: string,
  orderCount: number,            // 求购数量
  timestamp: number,             // 毫秒时间戳
  position?: number              // 位次 (1-30)
}
```

### SellListing（在售数据）
```typescript
{
  userId: string,
  userName: string,
  avatarUrl?: string,
  listingCount: number,          // 挂售数量
  timestamp: number
}
```

### Transaction（成交记录）
```typescript
{
  transactionId: string,
  buyerId: string,
  sellerId: string,
  price: number,
  timestamp: number
}
```

### UserTransactionStats（用户交易统计）
```typescript
{
  userId: string,
  userName: string,
  avatarUrl?: string,
  buyCount: number,              // 买入次数
  sellCount: number,             // 卖出次数
  totalCount: number             // 总交易次数
}
```

### PositionDistribution（位次分布）
```typescript
{
  userId: string,
  userName: string,
  positions: [
    {
      position: number,          // 位次 (1-30)
      count: number              // 出现次数
    }
  ],
  totalOrders: number            // 总求购次数
}
```

### UserPairTransaction（用户交易对）
```typescript
{
  user1Id: string,
  user1Name: string,
  user2Id: string,
  user2Name: string,
  user1BoughtFromUser2: number,  // user1 从 user2 买入次数
  user2BoughtFromUser1: number,  // user2 从 user1 买入次数
  totalTransactions: number      // 总交易次数
}
```

---

## 实现建议

### 1. 数据库设计

#### 核心表结构

**users 表：**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    project_quota INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**projects 表：**
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    template_id INTEGER NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    member_level_required VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**crawl_data 表（原始爬虫数据）：**
```sql
CREATE TABLE crawl_data (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL,
    data_type VARCHAR(20) NOT NULL,  -- 'purchase' 或 'sell'
    raw_data JSONB NOT NULL,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_template_time (template_id, crawled_at)
);
```

**hourly_snapshots 表（每小时快照）：**
```sql
CREATE TABLE hourly_snapshots (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    hour_timestamp TIMESTAMP NOT NULL,
    buy_orders JSONB,         -- 存储 BuyOrder[]
    sell_listings JSONB,      -- 存储 SellListing[]
    transactions JSONB,       -- 存储 Transaction[]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, hour_timestamp)
);
```

### 2. 数据采集流程

**定时任务（Celery）：**

1. **每小时执行一次爬虫任务：**
```python
@celery.task
def crawl_market_data(template_id):
    """
    爬取指定 template_id 的市场数据
    """
    # 1. 爬取求购数据（前30名）
    purchase_orders = crawl_purchase_orders(template_id)
    
    # 2. 爬取在售数据（前30名）
    sell_commodities = crawl_sell_commodities(template_id)
    
    # 3. 爬取成交记录
    transactions = crawl_transactions(template_id)
    
    # 4. 存储原始数据到 crawl_data 表
    save_crawl_data(template_id, purchase_orders, sell_commodities, transactions)
    
    # 5. 生成快照并存储到 hourly_snapshots 表
    create_hourly_snapshot(template_id, purchase_orders, sell_commodities, transactions)
```

2. **数据清洗与标准化：**
```python
def normalize_crawl_data(raw_data):
    """
    将爬虫数据转换为标准格式
    """
    return {
        "userId": extract_user_id(raw_data),
        "userName": raw_data.get("user_name"),
        "orderCount": raw_data.get("count"),
        "position": raw_data.get("rank"),
        "timestamp": int(time.time() * 1000)
    }
```

### 3. 分析数据生成

**实时计算（推荐）：**
```python
def get_project_analysis(project_id, time_range_hours=24):
    """
    根据时间范围实时计算分析数据
    """
    # 1. 获取时间范围内的快照数据
    cutoff_time = datetime.now() - timedelta(hours=time_range_hours)
    snapshots = get_snapshots_since(project_id, cutoff_time)
    
    # 2. 聚合求购数据
    top_buyers = aggregate_buy_orders(snapshots)
    buyer_position_dist = calculate_position_distribution(snapshots)
    
    # 3. 聚合在售数据
    top_sellers = aggregate_sell_listings(snapshots)
    
    # 4. 分析成交数据
    transactions = extract_all_transactions(snapshots)
    top_buyers_tx = analyze_buyers(transactions)
    top_sellers_tx = analyze_sellers(transactions)
    active_pairs = find_active_pairs(transactions)
    
    # 5. 计算统计数据
    statistics = calculate_statistics(snapshots)
    
    return {
        "analysis": {
            "topBuyers": top_buyers[:30],
            "buyerPositionDistribution": buyer_position_dist[:10],
            "topSellers": top_sellers[:30],
            "topBuyers_transactions": top_buyers_tx[:20],
            "topSellers_transactions": top_sellers_tx[:20],
            "activePairs": active_pairs[:20]
        },
        "statistics": statistics
    }
```

**缓存策略（Redis）：**
```python
def get_project_analysis_cached(project_id, time_range):
    cache_key = f"analysis:{project_id}:{time_range}"
    
    # 尝试从缓存获取
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # 计算并缓存
    result = get_project_analysis(project_id, time_range)
    redis.setex(cache_key, 300, json.dumps(result))  # 缓存5分钟
    
    return result
```

### 4. 性能优化建议

1. **数据库索引：**
```sql
-- 加速时间范围查询
CREATE INDEX idx_hourly_snapshots_time ON hourly_snapshots(project_id, hour_timestamp DESC);

-- 加速 template_id 查询
CREATE INDEX idx_projects_template ON projects(template_id);
```

2. **分页查询：**
```python
# 对于大数据集，使用分页
def get_top_buyers(snapshots, limit=30, offset=0):
    aggregated = aggregate_buy_orders(snapshots)
    return sorted(aggregated, key=lambda x: x['orderCount'], reverse=True)[offset:offset+limit]
```

3. **异步任务：**
```python
# 使用 Celery 异步生成分析报告
@celery.task
def generate_analysis_report(project_id, time_range):
    result = get_project_analysis(project_id, time_range)
    # 存储到缓存或数据库
    store_analysis_result(project_id, time_range, result)
```

### 5. 错误处理

**统一错误响应格式：**
```json
{
  "error": "error_code",
  "message": "人类可读的错误描述",
  "details": {
    "field": "具体的错误信息"
  }
}
```

**常见错误码：**
- `401 Unauthorized`: 未授权或 token 失效
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `422 Unprocessable Entity`: 请求参数验证失败
- `500 Internal Server Error`: 服务器内部错误

---

## 测试用例

### 示例 1：获取项目列表
```bash
curl -X GET http://localhost:5001/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 示例 2：获取项目分析数据
```bash
curl -X GET "http://localhost:5001/api/projects/1/analysis?timeRange=24" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 示例 3：创建新项目
```bash
curl -X POST http://localhost:5001/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "template_id": 49082
  }'
```

---

## 部署建议

### 环境变量配置
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/huanghe_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-secret-key-here
JWT_EXPIRATION_HOURS=24
CRAWLER_INTERVAL_HOURS=1
```

### Docker Compose 示例
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: huanghe_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  celery:
    build: .
    command: celery -A app.celery worker --loglevel=info
    depends_on:
      - redis
      - db

volumes:
  postgres_data:
```

---

## 更新日志

**v1.0.0 (2025-10-13)**
- 初始版本
- 定义核心 API 接口
- 定义数据分析接口
- 提供实现建议

---

## 联系方式

如有问题或建议，请联系开发团队。
