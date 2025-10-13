# 在售数据显示更新说明

## 更新时间
2025-10-13

## 问题背景
后端在售数据（`topSellers`）返回了两个名称字段：
- `userName` - 实际是**店铺名**（如 "9099的店铺"）
- `userNickName` - 实际是**用户昵称**（如 "YP0006759099"）

前端需要同时显示这两个信息，让用户能看到完整的卖家信息。

---

## 后端返回数据结构

```json
{
  "topSellers": [
    {
      "userId": "6759099",
      "userName": "9099的店铺",         // 店铺名
      "userNickName": "YP0006759099",  // 用户昵称
      "avatarUrl": "https://...",
      "listingCount": 813,
      "timestamp": 1760328142213
    }
  ]
}
```

---

## 修改的文件

### 1. `/types/project.ts` - 类型定义更新

```typescript
// 在售数据
export interface SellListing {
    userId: string;
    userName: string;        // 店铺名
    userNickName?: string;   // 用户昵称 (可选)
    avatarUrl?: string;
    listingCount: number;
    timestamp: number;
}
```

**说明**：
- 添加 `userNickName?` 可选字段
- 保持向后兼容（旧数据可能没有此字段）

### 2. `/lib/api.ts` - API 类型更新

```typescript
topSellers: Array<{
    userId: string;
    userName: string;
    userNickName?: string;   // 新增
    avatarUrl: string;
    listingCount: number;
    timestamp: number;
}>;
```

### 3. `/components/SellListingsSection.tsx` - 显示逻辑更新

#### 显示规则：

1. **如果有用户昵称（userNickName）**：
   ```
   用户昵称 (大号字体，深灰色)
   店铺名 (小号字体，中灰色)
   ID: userId
   挂售: X次
   ```

2. **如果没有用户昵称**：
   ```
   店铺名 (大号字体，深灰色)
   ID: userId
   挂售: X次
   ```

#### 代码实现：

```tsx
<div className="flex-1 min-w-0">
  {seller.userNickName && (
    <div className="font-medium truncate text-gray-800">
      {seller.userNickName}
    </div>
  )}
  <div className={`text-sm truncate ${
    seller.userNickName 
      ? 'text-gray-600'           // 有昵称时，店铺名用小字
      : 'font-medium text-gray-800' // 没昵称时，店铺名用大字
  }`}>
    {seller.userName}
  </div>
  <div className="text-xs text-gray-500 truncate">
    ID: {seller.userId}
  </div>
  <div className="text-sm text-green-600 font-semibold">
    挂售: {seller.listingCount}次
  </div>
</div>
```

---

## 显示效果

### 情况 1：有用户昵称
```
📦 卡片内容：
┌─────────────────────────┐
│ #1  🎭                  │
│     YP0006759099       │ ← 用户昵称（大，粗体）
│     9099的店铺          │ ← 店铺名（小，次要）
│     ID: 6759099         │
│     挂售: 813次         │
└─────────────────────────┘
```

### 情况 2：没有用户昵称
```
📦 卡片内容：
┌─────────────────────────┐
│ #1  🎭                  │
│     9099的店铺          │ ← 店铺名（大，粗体）
│     ID: 6759099         │
│     挂售: 813次         │
└─────────────────────────┘
```

---

## 样式说明

### 文字层级
- **用户昵称**（如果有）：`font-medium text-gray-800` - 主要信息
- **店铺名**：
  - 有昵称时：`text-sm text-gray-600` - 次要信息
  - 无昵称时：`font-medium text-gray-800` - 主要信息
- **用户ID**：`text-xs text-gray-500` - 辅助信息
- **挂售次数**：`text-sm text-green-600 font-semibold` - 强调信息

### 其他特性
- ✅ 所有文本都有 `truncate` 防止溢出
- ✅ 头像加载失败时自动回退到 `/logo.ico`
- ✅ 鼠标悬停时卡片边框变绿色（`hover:border-green-300`）
- ✅ 响应式布局（1列 → 2列 → 3列）

---

## 数据兼容性

### 向后兼容
如果后端返回的数据中**没有** `userNickName` 字段：
- ✅ 不会报错（字段定义为可选 `?`）
- ✅ 正常显示店铺名作为主要标识
- ✅ 布局自动调整

### 测试用例

#### 测试 1：完整数据
```json
{
  "userId": "6759099",
  "userName": "9099的店铺",
  "userNickName": "YP0006759099",
  "listingCount": 813
}
```
✅ 显示两行：用户昵称 + 店铺名

#### 测试 2：缺少昵称
```json
{
  "userId": "6759099",
  "userName": "9099的店铺",
  "listingCount": 813
}
```
✅ 显示一行：店铺名（作为主要标识）

#### 测试 3：空昵称
```json
{
  "userId": "6759099",
  "userName": "9099的店铺",
  "userNickName": "",
  "listingCount": 813
}
```
✅ 空字符串会被 JavaScript 判断为 falsy，只显示店铺名

---

## 与求购数据对比

### 求购数据（topBuyers）
```json
{
  "userId": "349043",
  "userName": "在线打钱的店铺",  // 只有一个名称字段
  "avatarUrl": "https://...",
  "orderCount": 258
}
```
- ✅ 只有 `userName`，直接显示
- ✅ 有真实头像 URL

### 在售数据（topSellers）- 新版
```json
{
  "userId": "6759099",
  "userName": "9099的店铺",      // 店铺名
  "userNickName": "YP0006759099", // 用户昵称
  "avatarUrl": "https://...",
  "listingCount": 813
}
```
- ✅ 有两个名称字段，分层显示
- ✅ 有真实头像 URL

---

## 编译状态
✅ TypeScript 编译通过（无错误）  
✅ 类型定义正确  
✅ 向后兼容  

---

## 未来优化建议

1. **后端统一命名**
   - 建议将 `userName` 改为 `storeName`（更语义化）
   - 或者在 API 文档中明确说明各字段含义

2. **前端优化**
   - 可以添加 Tooltip，鼠标悬停显示完整信息
   - 可以添加筛选功能（按挂售次数、用户名等）
   - 可以添加排序功能

3. **用户体验**
   - 点击卡片可以查看用户详细信息
   - 可以标记收藏的卖家
   - 可以对比不同卖家的挂售历史

---

## 相关文档
- [前后端集成文档](./frontend-backend-integration.md)
- [后端 API 开发文档](./backend-api-spec.md)
