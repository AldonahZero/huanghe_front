# ✅ 开发模式配置完成

## 🎉 已完成的修改

### 1. 环境变量配置

**`.env.local`** - 本地开发环境
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_DEV_MODE=true  # ← 新增!跳过登录验证
```

**`.env.example`** - 环境变量模板
```bash
# 已添加开发模式说明
NEXT_PUBLIC_DEV_MODE=true
```

### 2. 认证上下文修改

**`contexts/AuthContext.tsx`**
- ✅ 添加开发模式检测逻辑
- ✅ 自动创建模拟用户(管理员权限)
- ✅ 跳过真实登录流程
- ✅ 在控制台显示提示信息

### 3. 文档和脚本

**新增文件**:
- `DEV_MODE_GUIDE.md` - 详细使用指南
- `enable-dev-mode.sh` - 快速启用脚本
- `disable-dev-mode.sh` - 快速关闭脚本
- `DEV_MODE_SETUP.md` - 本配置总结

**更新文件**:
- `README.md` - 添加开发模式说明

## 🚀 如何使用

### 方法 1: 自动脚本(推荐)

```bash
# 启用开发模式
./enable-dev-mode.sh

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000/dashboard
# → 无需登录,直接进入!
```

### 方法 2: 手动配置

1. 编辑 `.env.local`:
```bash
NEXT_PUBLIC_DEV_MODE=true
```

2. 重启开发服务器:
```bash
# Ctrl+C 停止
pnpm dev
```

## 🔍 验证生效

启动后在浏览器控制台应该看到:
```
🔧 开发模式已启用 - 使用模拟用户登录
```

然后:
- ✅ 直接访问 `http://localhost:3000/dashboard`
- ✅ 访问 `http://localhost:3000/dashboard/profile`
- ✅ 访问 `http://localhost:3000/dashboard/project/1`
- ✅ 所有需要登录的页面都可以直接访问

## 👤 模拟用户信息

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

Token: `dev-mock-token-12345`

## 📊 使用场景

### ✅ 适合开发模式

| 场景 | 说明 |
|------|------|
| 🎨 UI 开发 | 快速调试页面布局和样式 |
| 📊 Dashboard 调试 | 专注数据展示逻辑 |
| 🔧 组件开发 | 无需反复登录测试组件 |
| 🚀 原型开发 | 快速验证想法和交互 |
| 👀 截图演示 | 方便截取界面展示 |

### ❌ 不适合开发模式

| 场景 | 说明 |
|------|------|
| 🔐 登录测试 | 需要关闭开发模式测试真实流程 |
| 🔒 权限测试 | 开发模式固定为管理员权限 |
| 📡 API 测试 | 模拟 token 可能无法调用真实 API |
| 🧪 集成测试 | 需要真实的认证流程 |

## 🔄 切换模式

### 快速切换

```bash
# 启用开发模式
./enable-dev-mode.sh
pnpm dev

# 关闭开发模式
./disable-dev-mode.sh
# 重启: Ctrl+C, 然后 pnpm dev
```

### 手动切换

```bash
# 启用: .env.local
NEXT_PUBLIC_DEV_MODE=true

# 关闭: .env.local
NEXT_PUBLIC_DEV_MODE=false

# 然后重启开发服务器
```

## ⚠️ 重要提醒

### 生产环境安全

**`.env.production`** 必须设置:
```bash
NEXT_PUBLIC_API_URL=http://115.190.102.236/api
NEXT_PUBLIC_DEV_MODE=false  # 或者不设置此变量
```

### 检查清单

部署前确认:
- [ ] `.env.production` 不包含 `NEXT_PUBLIC_DEV_MODE=true`
- [ ] `.env.local` 已在 `.gitignore` 中(已配置 ✅)
- [ ] `git status` 不显示 `.env.local`
- [ ] 运行 `pnpm build` 成功
- [ ] 测试生产构建的登录功能

## 🐛 故障排查

### 问题 1: 修改后没生效

**原因**: Next.js 需要重启才能读取新的环境变量

**解决**:
```bash
# 完全停止开发服务器
Ctrl+C

# 清除缓存(可选)
rm -rf .next

# 重新启动
pnpm dev
```

### 问题 2: 控制台没有显示开发模式提示

**检查步骤**:
1. 确认 `.env.local` 中 `NEXT_PUBLIC_DEV_MODE=true`
2. 确认已重启开发服务器
3. 打开浏览器控制台查看
4. 刷新页面

### 问题 3: 还是跳转到登录页面

**可能原因**:
- 环境变量拼写错误
- 没有重启服务器
- 浏览器缓存

**解决**:
```bash
# 1. 检查拼写
cat .env.local

# 2. 清除缓存并重启
rm -rf .next
pnpm dev

# 3. 浏览器硬刷新
# Mac: Cmd+Shift+R
# Windows: Ctrl+Shift+R
```

### 问题 4: API 请求失败

**原因**: 模拟 token 不是真实的,后端会拒绝

**解决方案**:
1. **如果只需要调试 UI**: 忽略 API 错误,专注前端
2. **如果需要真实数据**: 
   - 关闭开发模式
   - 正常登录获取真实 token
   - 然后可以调用真实 API

## 📚 更多信息

详细文档:
- [开发模式使用指南](./DEV_MODE_GUIDE.md) - 完整说明
- [部署文档](./DEPLOYMENT.md) - 生产环境配置
- [README](./README.md) - 项目概览

## 🎯 快速参考

```bash
# 启用开发模式
./enable-dev-mode.sh && pnpm dev

# 关闭开发模式
./disable-dev-mode.sh && pnpm dev

# 查看当前配置
cat .env.local

# 清除缓存重启
rm -rf .next && pnpm dev
```

## ✨ 享受开发!

现在你可以:
- 🚀 快速访问所有页面
- 🎨 专注 UI 和交互开发
- 🔧 无需频繁登录
- 💡 提高开发效率

祝开发愉快! 🎉
