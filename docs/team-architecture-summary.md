# 团队管理功能架构总结

## 📋 架构概览

团队管理功能采用**两层架构设计**,为管理员和老师提供了清晰的团队管理界面。

```
侧边栏 "团队管理" 
    ↓
团队列表页 (/dashboard/teams)
    ├─ 管理员: 看到所有团队卡片
  └─ 老师: 只看到自己的团队卡片
        ↓ 点击团队卡片
团队详情页 (/dashboard/teams/[id])
    ├─ 团队信息编辑
    ├─ 团队头像管理
    └─ 邀请码管理
```

## 🎯 核心功能

### 第一层: 团队列表页
**路由**: `/dashboard/teams`  
**文件**: `app/dashboard/teams/page.tsx`

**功能特性**:
- ✅ 卡片式展示团队列表
- ✅ 显示团队头像、名称、描述、成员数量
- ✅ 管理员权限: 看到所有团队
- ✅ 老师权限: 只看到自己创建的团队
- ✅ 点击卡片跳转到团队详情页
- ✅ 刷新按钮

**UI 组件**:
- Card 卡片布局
- Avatar 头像显示
- Grid 网格布局(响应式)
- 悬停效果和过渡动画

### 第二层: 团队详情页
**路由**: `/dashboard/teams/[id]`  
**文件**: `app/dashboard/teams/[id]/page.tsx`

**功能特性**:
- ✅ 查看和编辑团队信息(名称、描述)
- ✅ 上传和管理团队头像(支持文件上传)
- ✅ 生成团队邀请码(配置次数和有效期)
- ✅ 查看和复制邀请码
- ✅ 返回团队列表按钮

**编辑流程**:
1. 点击"编辑信息"进入编辑模式
2. 修改团队信息 / 上传头像
3. 点击"保存更改"提交
4. 显示成功提示,退出编辑模式

## 🔐 权限控制

### 角色权限表

| 角色 | 团队列表访问 | 可见团队范围 | 团队编辑权限 |
|------|------------|------------|------------|
| 管理员 | ✅ | 所有团队 | 所有团队 |
| 老师 | ✅ | 自己的团队 | 自己的团队 |
| 普通成员 | ❌ | 无 | 无 |

### 权限实现

**侧边栏菜单** (`DashboardSidebar.tsx`):
```typescript
...(user?.role === "admin" || user?.role === "teacher" 
  ? [teamSettingItem] 
  : [])
```

**页面级权限检查**:
```typescript
const hasPermission = user?.role === "admin" || user?.role === "teacher";

if (!hasPermission) {
  return <AccessDenied />;
}
```

## 🌐 API 接口

### 新增接口

#### 1. 获取团队列表
```typescript
GET /api/teams

// 返回值根据用户角色:
// - 管理员: 所有团队
// - 教师: 自己的团队
```

#### 2. 获取指定团队信息
```typescript
GET /api/team/{teamId}/info
```

#### 3. 更新指定团队信息
```typescript
PUT /api/team/{teamId}/info
Body: { name?, description?, avatar_url? }
```

#### 4. 生成团队邀请码
```typescript
POST /api/team/{teamId}/invite-code
Body: { uses_allowed?, expires_in_days? }
```

#### 5. 获取团队邀请码列表
```typescript
GET /api/team/{teamId}/invite-codes
```

### API 函数 (lib/api.ts)
| 老师 | ✅ | 自己的团队 | 自己的团队 |
```typescript
// 新增
getTeams(): Promise<{ teams: TeamInfo[] }>

// 修改(添加 teamId 参数)
getTeamInfo(teamId: number): Promise<{ team: TeamInfo }>
updateTeamInfo(teamId: number, data): Promise<{ message, team }>
generateInviteCode(teamId: number, data): Promise<{ message, invite_code }>
getInviteCodes(teamId: number): Promise<{ invite_codes }>
```

## 📁 文件结构

```
app/
  dashboard/
    teams/
      page.tsx              # 团队列表页
      [id]/
        page.tsx            # 团队详情页

components/
  DashboardSidebar.tsx      # 侧边栏(带权限控制)
  DashboardTopbar.tsx       # 顶栏(带标题映射)

lib/
  api.ts                    # API 客户端(团队相关函数)

docs/
  team-settings-implementation.md   # 详细实现文档
  team-architecture-summary.md      # 本文档
```

## 🎨 UI/UX 亮点

### 团队列表页
- 📱 响应式卡片网格布局
- 🎯 悬停效果(阴影 + 头像边框高亮)
- 🔄 加载状态和空状态处理
- ⚡ 刷新按钮(带加载动画)

### 团队详情页
- 🔙 返回按钮(顶部显著位置)
- 🖼️ 头像上传(点击式,带预览)
- 📝 编辑模式切换(清晰的保存/取消按钮)
- 📋 邀请码复制(一键复制,视觉反馈)
- 🏷️ 状态标签(可用/已用完)

## 🚀 使用流程示例

### 管理员查看所有团队并编辑
1. 登录后在侧边栏点击"团队管理"
2. 看到所有团队的卡片列表
3. 点击某个团队卡片
4. 进入该团队的详情页
5. 点击"编辑信息"修改团队信息
6. 点击"生成邀请码"创建新邀请码
7. 点击"复制"按钮复制邀请码
8. 点击"返回团队列表"回到列表页

### 老师管理自己的团队
1. 登录后在侧边栏点击"团队管理"
2. 只看到自己创建的团队卡片
3. 点击团队卡片进入详情页
4. 上传团队头像,修改团队信息
5. 生成邀请码分享给学生
6. 完成后返回列表页

## ⚙️ 技术栈

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui
- **Icons**: lucide-react
- **Styling**: Tailwind CSS
- **State**: React Hooks (useState, useEffect, useRef)
- **Routing**: Next.js Dynamic Routes
- **Auth**: AuthContext (useAuth hook)

## ✅ 已完成功能清单

- [x] 团队列表页面 UI
- [x] 团队详情页面 UI
- [x] 权限控制(管理员/老师)
- [x] API 函数(getTeams, getTeamInfo, 等)
- [x] 团队信息编辑
- [x] 团队头像上传
- [x] 邀请码生成
- [x] 邀请码列表展示
- [x] 邀请码复制功能
- [x] 导航和路由
- [x] 响应式布局
- [x] 加载状态处理
- [x] 错误处理
- [x] 文档编写

## 🔜 后续优化建议

1. **头像上传增强**
   - 实现真实的文件上传到服务器
   - 添加图片裁剪功能
   - 支持拖拽上传

2. **邀请码功能扩展**
   - 显示邀请码使用记录
   - 添加删除邀请码功能
   - 邀请码过期提醒

3. **团队管理扩展**
   - 团队成员列表查看
   - 成员角色管理
   - 成员移除功能

4. **搜索和筛选**
   - 团队列表搜索
   - 按成员数量筛选
   - 按创建时间排序

5. **统计信息**
   - 团队活跃度统计
   - 邀请码使用情况分析
   - 成员增长趋势

## 📚 相关文档

- [团队设置详细实现文档](./team-settings-implementation.md)
- [用户信息实现文档](./user-profile-implementation.md)
- [头像上传实现文档](./avatar-upload-implementation.md)

## 后端对接: invites 字段期望说明

前端在团队详情页会优先使用 `GET /api/teams/<team_id>` 返回体中的 `invites` 字段（如果存在），否则回退到单独的 `GET /api/team/{teamId}/invite-codes`。请后端确保 `invites` 或 `invite_codes` 中包含以下字段：

示例:

```json
{
  "team": { /* ... */ },
  "members": [ /* ... */ ],
  "invites": [
    {
      "code": "ABC123",
      "uses_allowed": 3,
      "uses_remaining": 2,
      "expires_at": null,
      "created_by_admin_id": 1,
      "assigned_to_user_id": null,
      "is_active": true,
      "created_at": "2025-10-13T10:31:00",
      "member_level": "core"
    }
  ]
}
```

字段说明（invites / invite_codes）:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 邀请码文本 |
| uses_allowed | integer | 允许的最大使用次数 |
| uses_remaining | integer | 剩余可用次数 |
| expires_at | string|null | 过期时间（ISO 8601，或 null 表示不过期） |
| created_by_admin_id | integer|null | 创建该邀请码的管理员 ID（可为 null） |
| assigned_to_user_id | integer|null | 如果该邀请码被指定给某位用户使用，填写该用户 ID，否则为 null |
| is_active | boolean | 当前邀请码是否仍然有效（true/false） |
| created_at | string | 创建时间（ISO 8601） |
| member_level | string|null | 可选：此邀请码分配给新用户的会员等级（见下方枚举），若无则为 null |

关于 `member_level` 的四种取值（后端需保证使用下列值之一）:

| 值 | 含义 |
|-----|------|
| emperor | emperor（最高级别） |
| private_director | private_director（私董 / 私人董事类权限） |
| core | core（核心会员） |
| normal | normal（普通会员） |

兼容性说明:
- 如果后端使用不同字段名（例如 `level` 或 `assign_level`），请告知前端以便同步更新。
- 建议后端同时返回一个 `member_level_display` 字段以提供本地化友好名称（可选）。

---

### 管理员 & 老师相关接口补充（简要）

为了便于后端快速对接，以下是前端近期需要后端确认并支持的三个接口要点：

- POST `/api/admin/teams/<team_id>/invites`（管理员创建邀请码）
  - 接收请求体中可选的 `member_level` 字段并保存
  - 成功返回的 `invite` 对象应包含 `member_level`（若数据库中存在）

- GET `/api/teams/<team_id>`（团队详情）
  - 返回体中的 `invites` 数组若嵌入 invites，应包含 `member_level` 字段

- GET `/api/teachers/<teacher_id>/invites`（老师维度邀请列表，可选）
  - 返回的 invite 项也应包含 `member_level` 字段（若数据库中存在）

示例和更详细的字段说明见 `docs/team-settings-implementation.md` 中“前端对 invites 字段的期望说明”部分。

---

**最后更新**: 2025-10-13  
**版本**: 2.0 (两层架构)  
**状态**: ✅ 已完成并可用
