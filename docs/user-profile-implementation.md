# 用户个人信息功能实现文档

## 更新日期
2025年10月13日

## 功能概述
实现了完整的用户个人信息管理功能,包括:
1. 登录后自动获取完整的用户个人信息
2. 顶边栏显示用户头像和昵称
3. 个人信息页面支持查看和修改个人资料
4. 支持修改密码功能

---

## 一、后端接口集成

### 1.1 用户信息类型定义
更新了 `lib/api.ts` 中的 `UserProfileData` 接口,匹配后端返回的完整字段:

```typescript
export interface UserProfileData {
    id: number;
    username: string;              // 用户名(登录用)
    user_nickname?: string;        // 昵称(网站显示)
    email?: string;                // 邮箱
    role: string;                  // 角色
    member_type?: string;          // 会员类型
    member_level?: string;         // 会员等级
    avatar_url?: string;           // 头像URL
    team_id?: number;              // 团队ID
    team_name?: string;            // 团队名称
    invited_by_user_id?: number;   // 邀请人ID
    invited_by_username?: string;  // 邀请人用户名
    project_quota: number;         // 项目配额
    created_at: string;            // 创建时间
    updated_at: string;            // 更新时间
}
```

### 1.2 API 函数
添加了以下 API 函数:

#### 获取用户信息
```typescript
export async function getUserProfile(): Promise<UserProfileData>
```
- 接口: `GET /api/user/profile`
- 返回: 从 `{ profile: UserProfileData }` 中提取 profile 对象

#### 更新用户信息
```typescript
export async function updateUserProfile(data: {
    user_nickname?: string;
    email?: string;
    avatar_url?: string;
}): Promise<{ message: string; profile: UserProfileData }>
```
- 接口: `PUT /api/user/profile`
- 参数: 只能修改 user_nickname, email, avatar_url
- 返回: 消息和更新后的用户信息

#### 修改密码
```typescript
export async function updatePassword(
    oldPassword: string, 
    newPassword: string
): Promise<{ message: string }>
```
- 接口: `PUT /api/user/password`
- 参数: old_password 和 new_password
- 返回: 成功消息

---

## 二、认证上下文更新

### 2.1 User 类型定义
更新了 `contexts/AuthContext.tsx` 中的 User 类型,替换原来的 `any` 类型:

```typescript
type User = {
  id: number;
  username: string;
  user_nickname?: string;
  email?: string;
  role: string;
  member_type?: string;
  member_level?: string;
  avatar_url?: string;
  team_id?: number;
  team_name?: string;
  invited_by_user_id?: number;
  invited_by_username?: string;
  project_quota: number;
  created_at: string;
  updated_at: string;
};
```

### 2.2 登录流程优化
在 `login` 函数中添加了获取完整用户信息的逻辑:

```typescript
const login = async (values: { username: string; password: string }) => {
  const res = await api.login(values);
  if (!res?.token) throw new Error("无效的登录响应:缺少 token");
  
  setToken(res.token);
  api.setAuthToken(res.token);
  localStorage.setItem("hh_token", res.token);
  
  // 获取完整的用户信息
  try {
    const userProfile = await api.getUserProfile();
    setUser(userProfile);
    localStorage.setItem("hh_user", JSON.stringify(userProfile));
    
    // 设置权限
    const role = userProfile.role;
    const mapped = role === "admin" ? ["admin"] : [role];
    setPermissions(mapped);
    localStorage.setItem("hh_permissions", JSON.stringify(mapped));
  } catch (error) {
    // 失败时使用登录响应中的基本信息作为后备
    console.error("Failed to fetch user profile:", error);
  }
  
  router.push("/dashboard");
};
```

---

## 三、顶边栏用户信息显示

### 3.1 组件更新
更新了 `components/DashboardTopbar.tsx`,在右上角显示用户头像和信息:

#### 功能特性:
- **头像显示**: 使用 Avatar 组件显示用户头像
- **昵称优先**: 优先显示 user_nickname,没有则显示 username
- **角色标签**: 显示用户角色(管理员/教师/团队长/成员)
- **可点击**: 点击头像区域跳转到个人信息页面

#### 角色映射:
```typescript
user?.role === "admin" ? "管理员" : 
user?.role === "teacher" ? "教师" :
user?.role === "leader" ? "团队长" : "成员"
```

---

## 四、个人信息页面

### 4.1 页面路径
`/dashboard/account` (`app/dashboard/account/page.tsx`)

### 4.2 页面功能

#### 基本信息管理
1. **头像管理**
   - 显示当前头像
   - 支持输入头像 URL
   - 实时预览

2. **可修改字段**
   - 昵称 (user_nickname)
   - 邮箱 (email)
   - 头像 URL (avatar_url)

3. **只读字段**
   - 用户名 (username)
   - 角色 (role)
   - 会员等级 (member_level)
   - 所属团队 (team_name)
   - 项目配额 (project_quota)
   - 注册时间 (created_at)

#### 密码修改功能
1. **验证规则**
   - 所有字段必填
   - 新密码和确认密码必须一致
   - 新密码长度至少 6 位

2. **交互流程**
   - 点击"修改密码"按钮显示表单
   - 填写当前密码和新密码
   - 点击"确认修改"提交
   - 显示成功或失败消息

### 4.3 会员等级映射
```typescript
emperor -> 帝王
private_director -> 私董
core -> 核心
normal -> 普通
```

---

## 五、数据流

### 5.1 登录流程
```
1. 用户登录 (POST /api/auth/login)
   ↓
2. 获取 token
   ↓
3. 调用 getUserProfile() (GET /api/user/profile)
   ↓
4. 存储完整用户信息到 localStorage
   ↓
5. 跳转到仪表盘
```

### 5.2 信息更新流程
```
1. 用户修改信息
   ↓
2. 调用 updateUserProfile() (PUT /api/user/profile)
   ↓
3. 后端返回更新后的信息
   ↓
4. 更新 localStorage
   ↓
5. 显示成功消息
```

### 5.3 密码修改流程
```
1. 用户填写密码表单
   ↓
2. 前端验证(长度、一致性等)
   ↓
3. 调用 updatePassword() (PUT /api/user/password)
   ↓
4. 显示成功或失败消息
   ↓
5. 清空表单
```

---

## 六、本地存储

### 6.1 存储的数据
- `hh_token`: JWT 认证令牌
- `hh_user`: 完整的用户信息 JSON
- `hh_permissions`: 用户权限数组

### 6.2 数据同步
- 登录时: 从后端获取并存储
- 更新信息时: 更新 localStorage 中的 hh_user
- 页面加载时: 从 localStorage 读取并恢复状态

---

## 七、UI/UX 设计

### 7.1 布局
- 响应式设计,最大宽度 4xl (56rem)
- 使用 Card 组件组织信息
- 清晰的分区: 基本信息卡片 + 密码修改卡片

### 7.2 交互状态
1. **编辑模式切换**
   - 默认查看模式,输入框禁用
   - 点击"编辑信息"启用编辑
   - 编辑时显示"保存"和"取消"按钮

2. **加载状态**
   - 保存时按钮显示"保存中..."并禁用
   - 修改密码时按钮显示"修改中..."并禁用

3. **消息提示**
   - 成功: 绿色边框的 Alert
   - 错误: 红色边框的 Alert
   - 3秒后自动消失

### 7.3 视觉设计
- 头像尺寸: 24x24 (顶边栏), 96x96 (个人信息页)
- 配色: 使用 Tailwind 默认色系
- 圆角: 统一使用 rounded
- 间距: 使用 gap-3, gap-4, gap-6 保持一致

---

## 八、错误处理

### 8.1 API 错误
- 捕获所有 API 调用的错误
- 显示友好的错误消息
- 不会导致页面崩溃

### 8.2 验证错误
- 前端验证: 密码长度、一致性等
- 后端验证: 通过错误消息反馈给用户

### 8.3 网络错误
- 显示"更新失败,请稍后重试"
- 保留用户输入的数据

---

## 九、安全性

### 9.1 权限控制
- 所有接口都需要 JWT 认证
- 用户只能修改自己的信息
- 敏感字段(role, project_quota 等)不可修改

### 9.2 密码安全
- 密码字段使用 type="password"
- 旧密码验证由后端完成
- 最小密码长度: 6 位

---

## 十、后续优化建议

1. **头像上传**
   - 如果后端支持文件上传,可以添加本地文件选择
   - 添加图片裁剪功能

2. **表单验证**
   - 添加邮箱格式验证
   - 添加昵称长度限制

3. **实时同步**
   - 修改信息后刷新 Context 中的 user 对象
   - 避免需要刷新页面才能看到更新

4. **更多信息**
   - 显示邀请人信息
   - 显示会员类型说明

5. **权限提示**
   - 对于不可修改的字段,添加说明
   - 显示为什么某些字段只读

---

## 十一、测试要点

### 11.1 功能测试
- [ ] 登录后能看到完整的用户信息
- [ ] 顶边栏显示正确的头像和昵称
- [ ] 点击顶边栏头像能跳转到个人信息页
- [ ] 能够成功修改昵称、邮箱、头像URL
- [ ] 能够成功修改密码
- [ ] 取消编辑能恢复原始数据

### 11.2 错误测试
- [ ] 旧密码错误时显示错误消息
- [ ] 新密码长度不足时前端拦截
- [ ] 两次新密码不一致时前端拦截
- [ ] 网络错误时显示友好提示

### 11.3 边界测试
- [ ] 字段为空时的显示
- [ ] 超长字符串的处理
- [ ] 特殊字符的处理

---

## 十二、相关文件清单

### 修改的文件
1. `/lib/api.ts` - API 函数和类型定义
2. `/contexts/AuthContext.tsx` - 认证上下文和登录流程
3. `/components/DashboardTopbar.tsx` - 顶边栏用户信息显示
4. `/app/dashboard/account/page.tsx` - 个人信息页面(完全重写)

### 依赖的组件
1. `/components/ui/card.tsx`
2. `/components/ui/avatar.tsx`
3. `/components/ui/input.tsx`
4. `/components/ui/label.tsx`
5. `/components/ui/button.tsx`
6. `/components/ui/alert.tsx`

---

## 十三、备注

- 后端接口已经按照文档实现
- 所有字段名称使用 snake_case(如 user_nickname),与后端保持一致
- 前端不支持文件上传,头像通过 URL 方式更新
- 管理员的项目配额显示为"无限制"
