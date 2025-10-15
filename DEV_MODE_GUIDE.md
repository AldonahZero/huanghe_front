# 🔧 开发模式使用指南

## 功能说明

开发模式允许你在本地开发时跳过登录验证,直接访问所有需要认证的页面,方便调试和开发。

## 启用方法

### 1. 配置环境变量

在 `.env.local` 文件中添加:

```bash
NEXT_PUBLIC_DEV_MODE=true
```

### 2. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
pnpm dev
```

## 工作原理

当 `NEXT_PUBLIC_DEV_MODE=true` 时:

1. **自动模拟登录**
   - 系统自动创建一个模拟用户
   - 无需调用真实的登录 API
   - 所有需要认证的页面都可以直接访问

2. **模拟用户信息**
   ```json
   {
     "id": 1,
     "username": "dev_user",
     "user_nickname": "开发用户",
     "email": "dev@example.com",
     "role": "admin",
     "member_type": "individual",
     "member_level": "premium",
     "project_quota": 999,
     "permissions": ["admin"]
   }
   ```

3. **模拟 Token**
   - Token: `dev-mock-token-12345`
   - 自动设置到 API 客户端

## 使用场景

### ✅ 适合使用开发模式

- 🎨 调试 Dashboard UI
- 📊 开发数据展示组件
- 🔧 测试页面布局和样式
- 🚀 快速原型开发
- 👀 演示和截图

### ❌ 不适合使用开发模式

- 🔐 测试登录/注册功能
- 🔒 测试权限控制逻辑
- 📡 测试 API 请求和响应
- 🐛 调试认证相关的 bug
- 🧪 集成测试

## 验证是否生效

启动开发服务器后,在浏览器控制台应该看到:

```
🔧 开发模式已启用 - 使用模拟用户登录
```

然后你可以:
- ✅ 直接访问 `/dashboard` 无需登录
- ✅ 访问 `/dashboard/profile` 
- ✅ 访问 `/dashboard/project/[id]`
- ✅ 所有需要认证的页面都可以直接访问

## 关闭开发模式

### 方法 1: 修改环境变量

在 `.env.local` 中:

```bash
# 设置为 false
NEXT_PUBLIC_DEV_MODE=false

# 或者直接注释掉
# NEXT_PUBLIC_DEV_MODE=true

# 或者删除这一行
```

### 方法 2: 使用生产环境配置

生产环境 `.env.production` 不应包含此变量,或设置为 false:

```bash
NEXT_PUBLIC_DEV_MODE=false
```

### 重启服务器

修改后必须重启开发服务器才能生效:

```bash
# 停止服务器 (Ctrl+C)
pnpm dev
```

## 常见问题

### Q1: 开启开发模式后,登录页面还能访问吗?

**可以**。开发模式只是自动提供了一个模拟用户,不影响登录页面的正常显示和功能。你仍然可以测试登录页面的 UI。

### Q2: 开发模式下能调用真实 API 吗?

**可以**。开发模式只影响认证状态,不影响 API 调用。你可以:
- 使用模拟 token 调用 API (可能会失败,因为 token 不是真的)
- 或者先正常登录获取真实 token,然后继续使用

### Q3: 为什么修改了环境变量但没生效?

**原因**: Next.js 在构建时会编译环境变量,开发服务器启动时也会读取。

**解决**: 
1. 完全停止开发服务器 (Ctrl+C)
2. 重新启动: `pnpm dev`
3. 如果还不行,清除缓存: `rm -rf .next && pnpm dev`

### Q4: 开发模式会影响生产环境吗?

**不会**。只要你:
1. `.env.production` 中不设置或设置为 `false`
2. `.gitignore` 已忽略 `.env.local` (已配置)
3. 部署时使用 `pnpm build`(会使用 `.env.production`)

### Q5: 如何自定义模拟用户信息?

编辑 `contexts/AuthContext.tsx`,找到 `mockUser` 对象:

```tsx
const mockUser: User = {
  id: 1,
  username: "dev_user",
  user_nickname: "开发用户",
  email: "dev@example.com",
  role: "admin", // 可以改为 "user"
  // ... 其他字段
};
```

### Q6: 可以模拟不同角色吗?

可以。修改 `mockUser` 的 `role` 字段:

```tsx
// 管理员
role: "admin",
permissions: ["admin"]

// 普通用户
role: "user",
permissions: ["user"]

// 团队成员
role: "member",
permissions: ["member"]
```

## 安全提醒

### ⚠️ 重要

1. **永远不要在生产环境启用开发模式**
   ```bash
   # .env.production 应该是:
   NEXT_PUBLIC_DEV_MODE=false
   # 或者根本不包含此变量
   ```

2. **不要提交 `.env.local` 到 Git**
   - 已在 `.gitignore` 中配置
   - 检查: `git status` 不应显示 `.env.local`

3. **生产部署检查清单**
   - [ ] `.env.production` 不包含 `NEXT_PUBLIC_DEV_MODE=true`
   - [ ] 运行 `pnpm build` 无警告
   - [ ] 测试登录功能正常
   - [ ] 检查 API 请求使用正确的生产地址

## 最佳实践

### 开发工作流

```bash
# 1. 启动开发模式 (UI 开发)
# .env.local: NEXT_PUBLIC_DEV_MODE=true
pnpm dev
# → 快速访问所有页面,调试 UI

# 2. 测试认证功能时关闭开发模式
# .env.local: NEXT_PUBLIC_DEV_MODE=false
# 重启: pnpm dev
# → 测试真实登录流程

# 3. 需要时再次开启
# .env.local: NEXT_PUBLIC_DEV_MODE=true
# 重启: pnpm dev
```

### 团队协作

如果团队成员需要不同配置:

1. **使用 `.env.local.example` 模板**
   ```bash
   cp .env.local.example .env.local
   # 然后每个人根据需要修改
   ```

2. **在 README 中说明**
   - 如何启用/关闭开发模式
   - 适用场景
   - 注意事项

3. **代码审查检查**
   - 确保没有人提交 `.env.local`
   - 确保 `.env.production` 配置正确

## 相关文件

- `contexts/AuthContext.tsx` - 认证上下文实现
- `.env.local` - 本地开发环境变量
- `.env.production` - 生产环境变量
- `.env.example` - 环境变量模板

## 技术细节

### 实现逻辑

```typescript
// 在 AuthContext 中
const isDevMode = 
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_DEV_MODE === "true";

useEffect(() => {
  if (isDevMode) {
    // 设置模拟用户
    setUser(mockUser);
    setToken(mockToken);
    setPermissions(["admin"]);
    return;
  }
  // 正常的认证逻辑
  // ...
}, [isDevMode]);
```

### 环境变量优先级

1. `.env.local` (最高优先级,本地开发)
2. `.env.development` (开发环境)
3. `.env.production` (生产环境)
4. `.env` (默认)

### Next.js 环境变量规则

- `NEXT_PUBLIC_*` 前缀的变量可以在浏览器端使用
- 其他变量只在服务器端可用
- 构建时编译,运行时不可修改

## 总结

开发模式是一个强大的工具,可以极大提高 UI 开发效率:

✅ **优点**:
- 快速开发,无需反复登录
- 专注 UI 调试
- 加速原型开发
- 方便演示

⚠️ **注意**:
- 仅用于本地开发
- 不要用于测试认证逻辑
- 确保生产环境关闭
- 定期测试真实登录流程

🚀 **使用建议**:
- UI 开发时开启
- API 测试时关闭
- 提交代码前测试真实流程
- 部署前检查环境配置
