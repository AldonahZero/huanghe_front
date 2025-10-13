# Lanyard 卡片动态用户信息集成

## 更新日期
2025年10月13日

## 功能概述
将 LanyardClient 组件与用户认证信息集成,从 AuthContext 动态获取用户信息并显示在 ProfileCard 中。

---

## 一、修改内容

### 1.1 导入 AuthContext
```typescript
import { useAuth } from "@/contexts/AuthContext";
```

### 1.2 获取用户信息
```typescript
const { user } = useAuth();
```

### 1.3 会员等级映射函数
添加了会员等级文本转换函数:

```typescript
const getMemberLevelText = (level?: string) => {
  if (!level) return "普通会员";
  const levelMap: Record<string, string> = {
    emperor: "帝王会员",
    private_director: "私董会员",
    core: "核心会员",
    normal: "普通会员",
  };
  return levelMap[level] || level;
};
```

---

## 二、字段映射关系

### ProfileCard 参数映射

| ProfileCard 参数 | 数据来源 | 说明 |
|-----------------|---------|------|
| `name` | `user?.user_nickname` 或 `user?.username` | 用户昵称(优先)或用户名 |
| `title` | `user?.team_name` | 团队名称,默认"黄河会" |
| `handle` | `user?.user_nickname` 或 `user?.username` | 用户昵称(优先)或用户名 |
| `status` | `getMemberLevelText(user?.member_level)` | 会员等级(格式化后) |
| `avatarUrl` | `user?.avatar_url` | 用户头像URL,默认"/logo.ico" |
| `contactText` | 固定文本 | "查看个人信息" |

### 会员等级映射

| 后端值 | 显示文本 |
|-------|---------|
| `emperor` | 帝王会员 |
| `private_director` | 私董会员 |
| `core` | 核心会员 |
| `normal` | 普通会员 |
| 无/其他 | 普通会员 |

---

## 三、交互改进

### 3.1 联系按钮功能
修改前:
```typescript
onContactClick={() => console.log("Contact clicked")}
```

修改后:
```typescript
onContactClick={() => {
  // 跳转到个人信息页面
  if (typeof window !== "undefined") {
    window.location.href = "/dashboard/account";
  }
}}
```

点击"查看个人信息"按钮后,会跳转到个人信息管理页面 `/dashboard/account`。

### 3.2 关闭按钮优化
添加了悬停效果:
```typescript
className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
```

---

## 四、数据流

### 4.1 数据获取流程
```
1. 用户登录
   ↓
2. AuthContext 存储用户信息
   ↓
3. LanyardClient 通过 useAuth() 获取
   ↓
4. 格式化数据(昵称、团队、等级)
   ↓
5. 传递给 ProfileCard 显示
```

### 4.2 数据优先级
- **昵称显示**: `user_nickname` > `username` > "用户"
- **团队显示**: `team_name` > "黄河会"(默认)
- **头像显示**: `avatar_url` > "/logo.ico"(默认)

---

## 五、显示示例

### 5.1 普通会员
```
Name: 张三
Title: 开发团队
Handle: 张三
Status: 普通会员
Avatar: https://example.com/avatar.jpg
```

### 5.2 帝王会员
```
Name: 李四
Title: 黄河会
Handle: 李四
Status: 帝王会员
Avatar: https://example.com/avatar2.jpg
```

### 5.3 无团队用户
```
Name: 王五
Title: 黄河会 (默认)
Handle: 王五
Status: 核心会员
Avatar: /logo.ico (默认)
```

---

## 六、使用场景

### 6.1 触发方式
1. **移动端**: 双击卡片(双指点击)
2. **桌面端**: 双击卡片

### 6.2 显示内容
- 用户头像(支持头像URL)
- 用户昵称
- 团队名称
- 会员等级
- "查看个人信息"按钮

### 6.3 交互流程
```
1. 用户双击工牌卡片
   ↓
2. 显示 ProfileCard 弹窗
   ↓
3. 展示用户个人信息
   ↓
4. 点击"查看个人信息" → 跳转到 /dashboard/account
   或
   点击"关闭" → 关闭弹窗
```

---

## 七、安全考虑

### 7.1 空值处理
所有用户数据字段都有默认值:
```typescript
user?.user_nickname || user?.username || "用户"
user?.team_name || "黄河会"
user?.avatar_url || "/logo.ico"
```

### 7.2 类型安全
使用可选链操作符 `?.` 确保在用户未登录或数据不完整时不会报错。

---

## 八、后续优化建议

### 8.1 加载状态
如果用户信息还在加载中,可以显示加载提示:
```typescript
if (!user) {
  return <div className="p-4">加载中...</div>;
}
```

### 8.2 更多信息
可以在 ProfileCard 中显示更多信息:
- 注册时间
- 项目数量
- 邀请人信息

### 8.3 动作优化
可以添加更多快捷操作:
- 修改个人信息
- 查看团队成员
- 退出登录

---

## 九、相关文件

### 修改的文件
- `/components/LanyardClient.tsx` - 集成用户认证信息

### 依赖的文件
- `/contexts/AuthContext.tsx` - 用户认证上下文
- `/components/ProfileCard.tsx` - 个人信息卡片组件

### 相关页面
- `/app/dashboard/account/page.tsx` - 个人信息管理页面

---

## 十、测试要点

### 10.1 功能测试
- [ ] 双击工牌显示 ProfileCard
- [ ] 显示正确的昵称
- [ ] 显示正确的团队名称
- [ ] 显示正确的会员等级
- [ ] 显示正确的头像
- [ ] 点击"查看个人信息"跳转正确

### 10.2 边界测试
- [ ] 用户未登录时的显示
- [ ] 用户无昵称时显示用户名
- [ ] 用户无团队时显示默认值
- [ ] 用户无头像时显示默认图标
- [ ] 会员等级为空或未知值时的处理

### 10.3 UI测试
- [ ] 移动端双击响应正常
- [ ] 桌面端双击响应正常
- [ ] 弹窗居中显示
- [ ] 关闭按钮正常工作
- [ ] 页面跳转正常

---

## 十一、备注

- 所有用户数据都来自 AuthContext,确保与登录状态同步
- 会员等级文本可以根据产品需求调整
- 支持未来扩展更多用户信息展示
- 建议定期检查 user 对象的数据完整性
