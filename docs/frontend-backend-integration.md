# 前端后端集成说明

## 更新内容

### 2025-10-13 - 接入后端项目分析接口

已完成前端与后端项目分析接口的集成，项目详情页现在使用真实的后端数据。

---

## 修改的文件

### 1. `/lib/api.ts`

新增 `getProjectAnalysis()` 函数和相关类型定义：

```typescript
// 新增接口类型定义
export interface ProjectAnalysisResponse {
    project: {
        id: number;
        name: string;
        template_id: number;
        is_active: boolean;
        created_at: string | null;
        item: {
            market_name: string;
            weapon: string;
            exterior: string;
            icon_url: string;
        } | null;
    };
    analysis: {
        timeRange: number;
        timestamp: string;
        topBuyers: Array<{...}>;
        buyerPositionDistribution: Array<{...}>;
        topSellers: Array<{...}>;
        topBuyers_transactions: any[];
        topSellers_transactions: any[];
        activePairs: any[];
    };
    statistics: {
        totalBuyOrders: number;
        totalSellListings: number;
        totalTransactions: number;
        activeBuyers: number;
        activeSellers: number;
        avgPrice: number;
        maxPrice: number;
        minPrice: number;
        priceChange24h: number;
    };
}

// 新增 API 函数
export async function getProjectAnalysis(
    projectId: number, 
    timeRange: number = 24
): Promise<ProjectAnalysisResponse>
```

**调用方式：**
```typescript
const response = await api.getProjectAnalysis(projectId, 24);
// response.project - 项目基本信息
// response.analysis - 分析数据
// response.statistics - 统计数据
```

---

### 2. `/app/dashboard/project/[id]/page.tsx`

完全重构，使用后端真实数据：

#### 主要变化：

**之前：**
- 使用 `generateMockProjectData()` 生成模拟数据
- 使用 `analyzeProjectData()` 分析模拟数据
- 分两次请求：`getProject()` + mock data

**现在：**
- 直接调用 `getProjectAnalysis(projectId, timeRange)`
- 一次请求获取所有数据（项目信息 + 分析数据 + 统计数据）
- 完全移除 mock 数据依赖

#### 代码结构：

```typescript
// State 管理
const [analysisData, setAnalysisData] = useState<api.ProjectAnalysisResponse | null>(null);
const [statistics, setStatistics] = useState<api.ProjectAnalysisResponse['statistics'] | null>(null);

// 数据加载
useEffect(() => {
    api.getProjectAnalysis(Number(projectId), timeRange)
        .then((response) => {
            setAnalysisData(response);
            setStatistics(response.statistics);
        })
        .catch((err) => {
            setError(err?.message || "加载项目分析数据失败");
        });
}, [projectId, timeRange, authLoading, token]);

// 数据展示
const project = analysisData.project;
const analysis = analysisData.analysis;
const item = project.item;
```

#### UI 变化：

1. **统计卡片更新：**
   - 第一张卡片：求购总数 + 活跃求购者
   - 第二张卡片：挂售总数 + 活跃卖家
   - 第三张卡片：平均价格 + 最高/最低价格（替代成交总数）

2. **交易数据加密提示：**
   - 当交易数据为空时，显示友好的加密提示
   - 使用黄色警告框提示用户交易数据目前无法获取

```typescript
{analysis.topBuyers_transactions.length === 0 && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-yellow-800">🔒 交易数据已加密</div>
        <div className="text-yellow-600">成交数据目前无法获取</div>
    </div>
)}
```

---

## 后端接口说明

### 接口地址
```
GET /api/projects/{project_id}/analysis?timeRange=24
```

### 请求参数
- `project_id` (路径参数): 项目ID
- `timeRange` (查询参数): 时间范围，可选值：12, 24, 48, 72，默认 24

### 请求头
```http
Authorization: Bearer <jwt_token>
```

### 响应结构

#### 成功响应 (200 OK)
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
    "timestamp": "2025-10-13T08:30:00",
    "topBuyers": [
      {
        "userId": "12345",
        "userName": "玩家A",
        "avatarUrl": "/logo.ico",
        "orderCount": 156,
        "position": 1,
        "timestamp": 1728806400000
      }
    ],
    "buyerPositionDistribution": [
      {
        "userId": "12345",
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
        "userId": "67890",
        "userName": "玩家D",
        "avatarUrl": "/logo.ico",
        "listingCount": 89,
        "timestamp": 1728806400000
      }
    ],
    "topBuyers_transactions": [],
    "topSellers_transactions": [],
    "activePairs": []
  },
  "statistics": {
    "totalBuyOrders": 2847,
    "totalSellListings": 1923,
    "totalTransactions": 0,
    "activeBuyers": 156,
    "activeSellers": 98,
    "avgPrice": 34523.75,
    "maxPrice": 36500.00,
    "minPrice": 33000.00,
    "priceChange24h": 0.0
  }
}
```

#### 错误响应

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "forbidden"
}
```

**404 Not Found:**
```json
{
  "error": "project not found"
}
```

---

## 数据映射说明

### 后端 → 前端数据流

#### 1. 项目基本信息
```typescript
后端: response.project.id          → 前端: project.id
后端: response.project.name        → 前端: 页面标题
后端: response.project.is_active   → 前端: Badge 状态
后端: response.project.item        → 前端: 饰品图标、名称、外观
```

#### 2. 求购数据
```typescript
后端: response.analysis.topBuyers[30]                  → 前端: BuyOrdersSection
后端: response.analysis.buyerPositionDistribution[10]  → 前端: 位次分布图表
```

#### 3. 在售数据
```typescript
后端: response.analysis.topSellers[30]  → 前端: SellListingsSection
```

#### 4. 统计数据
```typescript
后端: response.statistics.totalBuyOrders      → 前端: 第一张统计卡片
后端: response.statistics.totalSellListings   → 前端: 第二张统计卡片
后端: response.statistics.avgPrice            → 前端: 第三张统计卡片
后端: response.statistics.activeBuyers        → 前端: 活跃求购者数量
后端: response.statistics.activeSellers       → 前端: 活跃卖家数量
```

---

## 已知限制

### 1. 交易数据加密
后端返回的以下字段目前为空数组：
- `topBuyers_transactions` - 成交买入榜
- `topSellers_transactions` - 成交卖出榜
- `activePairs` - 活跃交易对

**原因：** 交易数据已加密，无法从爬虫数据中获取

**前端处理：** 显示友好的加密提示，不展示空的交易数据表格

### 2. 稀有度字段缺失
后端 `item` 对象中没有 `rarity` 字段

**临时方案：** 前端隐藏稀有度显示

**建议：** 后端从 `CSGOItem` 表中补充 `rarity` 字段

---

## 测试清单

### 功能测试
- [x] 项目详情页加载正常
- [x] 时间范围切换 (12/24/48/72小时) 工作正常
- [x] 统计卡片显示真实数据
- [x] 求购榜显示后端数据（前30名）
- [x] 位次分布显示后端数据（前10名）
- [x] 在售榜显示后端数据（前30名）
- [x] 交易数据加密提示显示正常
- [x] 项目状态 Badge 显示正确（启动中/已暂停）
- [x] 饰品图标和名称显示正常
- [x] 启动时间格式化正确

### 错误处理
- [x] 401 未授权时跳转登录
- [x] 403 无权限时显示错误提示
- [x] 404 项目不存在时显示错误提示
- [x] 网络错误时显示友好提示
- [x] 刷新页面后数据正常加载

### 性能测试
- [x] 单次请求获取所有数据（不再多次请求）
- [x] 时间范围切换响应及时
- [x] Loading 状态显示友好

---

## 未来优化建议

### 1. 后端优化
- [ ] 添加 `rarity` 字段到 `item` 对象
- [ ] 实现交易数据解密逻辑（如果可能）
- [ ] 添加数据缓存机制（Redis）
- [ ] 实现 `priceChange24h` 的真实计算

### 2. 前端优化
- [ ] 添加数据缓存（避免频繁切换时间范围时重复请求）
- [ ] 添加数据导出功能（CSV/Excel）
- [ ] 实现实时数据推送（WebSocket）
- [ ] 优化移动端展示

### 3. 用户体验
- [ ] 添加数据加载骨架屏
- [ ] 实现数据趋势图表（折线图）
- [ ] 添加用户详情页（点击用户名查看详情）
- [ ] 实现数据对比功能（不同时间范围对比）

---

## 相关文档

- [后端 API 开发文档](./backend-api-spec.md)
- [项目详情页面功能文档](../task/项目详情页面功能文档.md)

---

## 更新历史

**v1.0.0 (2025-10-13)**
- 初次集成后端分析接口
- 移除 mock 数据依赖
- 添加交易数据加密提示

---

## 联系方式

如有问题或建议，请联系开发团队。
