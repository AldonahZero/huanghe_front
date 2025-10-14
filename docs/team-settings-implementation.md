# 团队管理功能实现文档

## 概述
团队管理功能采用两层架构:管理员和老师首先看到团队列表,点击具体团队后进入该团队的详细设置页面,可以管理团队信息、上传团队头像、生成和管理团队邀请码。

## 架构设计

### 两层结构
1. **团队列表页** (`/dashboard/teams`)
   - 管理员: 可以看到所有团队的卡片
  - 老师: 只能看到自己的团队卡片
   - 点击团队卡片进入该团队的详细设置页面

2. **团队详情页** (`/dashboard/teams/[id]`)
   - 显示和编辑指定团队的详细信息
   - 管理团队头像
   - 生成和管理该团队的邀请码

## 权限模型
- **访问权限**: 仅限 `admin` 和 `teacher` 角色
- **权限差异**:
  - 管理员: 在列表页可以看到所有团队,可以编辑任何团队
  - 老师: 在列表页只能看到自己的团队,只能编辑自己的团队
- **普通成员**: 无法访问团队管理页面
- **权限检查位置**:
  - 前端: 两个页面都使用 `useAuth()` 检查用户角色
  - 侧边栏: `components/DashboardSidebar.tsx` 条件渲染菜单项

## 功能模块

### 1. 团队信息管理

#### 可编辑字段
- **团队名称** (`name`): 文本输入
- **团队描述** (`description`): 多行文本输入
- **团队头像** (`avatar_url`): 文件上传或URL

#### 只读字段
- **团队ID** (`id`)
- **成员数量** (`member_count`)
- **创建者** (`owner_name` / `owner_id`)
- **创建时间** (`created_at`)

#### 头像上传功能
- **支持格式**: JPG, PNG, GIF, WebP
- **大小限制**: 最大 5MB
- **上传方式**: 点击头像或上传按钮
- **预览功能**: 实时显示选中的头像
- **删除功能**: 可取消已选择的头像

### 2. 邀请码管理

#### 生成邀请码
- **可使用次数** (`uses_allowed`): 数字输入,默认 10
- **有效期(天)** (`expires_in_days`): 数字输入,默认 30
- **生成流程**:
  1. 点击"生成邀请码"按钮
  2. 填写表单(次数、有效期)
  3. 点击"确认生成"
  4. 自动刷新邀请码列表

#### 邀请码列表
- **显示信息**:
  - 邀请码(等宽字体高亮显示)
  - 剩余次数 / 总次数
  - 创建时间
  - 过期时间
  - 状态标签(可用/已用完)
- **操作按钮**:
  - 复制按钮: 一键复制邀请码到剪贴板
  - 状态反馈: 复制成功后显示"已复制"图标
- **刷新功能**: 手动刷新邀请码列表

## 技术实现

### API 接口

#### 获取团队列表
```typescript
GET /api/teams

Response:
{
  "code": 0,
  "teams": [
    {
      "id": 1,
      "name": "团队名称",
      "owner_id": 123,
      "owner_name": "张三",
      "description": "团队描述",
      "avatar_url": "https://...",
      "member_count": 15,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-15T00:00:00"
    }
  ]
}

说明: 
- 管理员: 返回所有团队
- 老师: 只返回自己创建的团队
```

#### 获取指定团队信息
```typescript
GET /api/team/{teamId}/info

Response:
{
  "code": 0,
  "team": {
    "id": 1,
    "name": "团队名称",
    "owner_id": 123,
    "owner_name": "张三",
    "description": "团队描述",
    "avatar_url": "https://...",
    "member_count": 15,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-15T00:00:00"
  }
}
```

#### 更新团队信息
```typescript
PUT /api/team/{teamId}/info

Request Body:
{
  "name"?: string,
  "description"?: string,
  "avatar_url"?: string
}

Response:
{
  "code": 0,
  "message": "团队信息更新成功",
  "team": { /* 更新后的团队信息 */ }
}
```

#### 生成邀请码
```typescript
POST /api/team/{teamId}/invite-code

Request Body:
{
  "uses_allowed": number,
  "expires_in_days": number
}

Response:
{
  "code": 0,
  "message": "邀请码生成成功",
  "invite_code": {
    "id": 1,
    "code": "ABC123XYZ",
    "team_id": 1,
    "uses_allowed": 10,
    "uses_remaining": 10,
    "created_by_admin_id": 123,
    "created_by_admin_name": "张三",
    "created_at": "2024-01-01T00:00:00",
    "expires_at": "2024-01-31T23:59:59"
  }
}
```

#### 获取邀请码列表
```typescript
GET /api/team/{teamId}/invite-codes

Response:
{
  "code": 0,
  "invite_codes": [
    {
      "id": 1,
      "code": "ABC123XYZ",
      "team_id": 1,
      "uses_allowed": 10,
      "uses_remaining": 5,
      "created_by_admin_id": 123,
      "created_by_admin_name": "张三",
      "created_at": "2024-01-01T00:00:00",
      "expires_at": "2024-01-31T23:59:59"
    }
  ]
}
```

### 前端组件

#### 团队列表页面
**文件**: `app/dashboard/teams/page.tsx`

**功能**:
- 展示团队卡片列表(管理员看所有,老师看自己的)
- 显示团队基本信息(头像、名称、描述、成员数量等)
- 点击卡片或"管理团队"按钮跳转到详情页

**状态管理**:
- `teams`: 团队列表
- `loading`: 加载状态
- `message`: 消息提示

**核心功能**:
- `loadTeams()`: 加载团队列表
- `handleTeamClick(teamId)`: 跳转到团队详情页

#### 团队详情页面
**文件**: `app/dashboard/teams/[id]/page.tsx`

**功能**:
- 显示和编辑指定团队的详细信息
- 管理团队头像(文件上传)
- 生成和管理该团队的邀请码
- 返回团队列表按钮

**状态管理**:
- `teamInfo`: 团队信息
- `formData`: 编辑表单数据
- `avatarPreview`: 头像预览
- `inviteCodes`: 邀请码列表
- `inviteForm`: 邀请码生成表单
- `isEditing`: 编辑模式开关
- `message`: 消息提示

**核心功能函数**:
- `loadTeamInfo()`: 加载指定团队信息
- `loadInviteCodes()`: 加载邀请码列表
- `handleAvatarFileChange()`: 处理头像文件选择
- `handleSave()`: 保存团队信息
- `handleGenerateCode()`: 生成邀请码
- `handleCopyCode()`: 复制邀请码到剪贴板

#### 侧边栏菜单
**文件**: `components/DashboardSidebar.tsx`

**权限控制**:
```typescript
const menuItems = [
  ...baseMenuItems,
  ...(user?.role === "admin" || user?.role === "teacher" 
    ? [teamSettingItem] 
    : []),
  settingsItem,
];
```

**菜单链接**: `/dashboard/teams` (指向团队列表页)

#### 顶栏标题
**文件**: `components/DashboardTopbar.tsx`

**标题映射**:
```typescript
const mapTitle: Record<string, string> = {
  // ...
  "/dashboard/teams": "团队管理",
  // ...
};

// 动态路由处理
if (pathname?.startsWith("/dashboard/teams/")) {
  title = "团队设置";
}
```

### UI 组件库

使用 shadcn/ui 组件:
- `Card` / `CardHeader` / `CardContent` / `CardTitle` / `CardDescription`
- `Avatar` / `AvatarImage` / `AvatarFallback`
- `Input` / `Label`
- `Button`
- `Alert`

使用 lucide-react 图标:
- `Upload`: 上传图标
- `Copy`: 复制图标
- `RefreshCw`: 刷新图标
- `X`: 删除/关闭图标
- `Check`: 确认/成功图标

## 用户体验设计

### 交互流程

#### 浏览团队列表
1. 管理员或老师登录后,在侧边栏看到"团队管理"菜单项
2. 点击进入团队列表页 (`/dashboard/teams`)
3. 管理员看到所有团队卡片,老师只看到自己的团队卡片
4. 卡片显示团队头像、名称、描述、成员数量等信息
5. 点击卡片或"管理团队"按钮进入团队详情页

#### 编辑团队信息
1. 在团队详情页点击"编辑信息"按钮
2. 输入框变为可编辑状态
3. 用户修改信息(可选上传头像)
4. 点击"保存更改"
5. 显示成功/失败消息
6. 自动退出编辑模式
7. 可点击"返回团队列表"按钮回到列表页

#### 生成邀请码
1. 用户点击"生成邀请码"按钮
2. 展开生成表单
3. 填写次数和有效期
4. 点击"确认生成"
5. 显示成功消息
6. 自动刷新列表并关闭表单

#### 复制邀请码
1. 用户点击邀请码旁的"复制"按钮
2. 系统调用 `navigator.clipboard.writeText()`
3. 按钮文字变为"已复制"(绿色)
4. 2秒后恢复原状

### 响应式设计
- **加载状态**: 显示加载动画
- **错误处理**: Alert 组件显示错误信息
- **成功反馈**: Alert 组件显示成功信息(3秒后自动消失)
- **权限不足**: 显示友好的权限提示页面

### 视觉反馈
- **编辑模式**: 头像显示悬停效果和上传图标
- **头像选择**: 显示预览和删除按钮
- **复制成功**: 按钮图标和文字变化
- **状态标签**: 可用(绿色) / 已用完(灰色)

## 安全考虑

### 前端验证
- 文件类型验证(image/jpeg, image/png, etc.)
- 文件大小验证(最大 5MB)
- 权限检查(角色验证)
- 输入参数验证(次数、有效期)

### 后端验证(需确认)
- JWT 令牌验证
- 用户角色验证
- 团队所属关系验证
- 邀请码唯一性验证
- 文件上传安全扫描

## 待实现功能

1. **头像文件上传到后端**
   - 当前使用 Base64 预览
   - 需要实现 FormData 文件上传
   - 后端需提供文件上传接口

2. **邀请码删除功能**
   - 允许管理员删除未使用的邀请码

3. **邀请码使用记录**
   - 显示邀请码被谁使用
   - 使用时间记录

4. **团队成员管理**
   - 查看团队成员列表
   - 移除成员功能

## 测试要点

### 功能测试
- [ ] 管理员可以访问团队列表页面
 - [ ] 老师可以访问团队列表页面
- [ ] 普通成员无法访问团队管理页面
- [ ] 管理员在列表页可以看到所有团队
 - [ ] 老师在列表页只能看到自己的团队
- [ ] 点击团队卡片可以进入详情页
- [ ] 团队详情页可以正确加载指定团队的信息
- [ ] 团队信息编辑和保存功能正常
- [ ] 头像上传(文件选择、预览、删除)正常
- [ ] 邀请码生成功能正常(带teamId参数)
- [ ] 邀请码列表加载正常(带teamId参数)
- [ ] 邀请码复制功能正常
- [ ] 返回团队列表功能正常
- [ ] 刷新功能正常

### 边界测试
- [ ] 上传超大文件(>5MB)显示错误
- [ ] 上传错误格式文件显示错误
- [ ] 无效的次数或有效期显示错误
- [ ] 网络错误时的错误处理
- [ ] 权限不足时的页面显示

### UI/UX 测试
- [ ] 加载状态显示正常
- [ ] 成功/错误消息显示正常
- [ ] 按钮禁用状态正常
- [ ] 复制反馈动画正常
- [ ] 响应式布局正常

## 前端对 invites 字段的期望说明 (供后端对接)

前端在团队详情页会优先使用 `GET /api/teams/<team_id>` 返回体中的 `invites` 字段（如果存在），否则回退到单独的 `GET /api/team/{teamId}/invite-codes`。为了保证前端功能完整，请后端确保 `invites` 或 `invite_codes` 中包含以下字段。

示例（团队详情返回中 embeds invites）:

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

字段说明（invites / invite_codes）：

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 邀请码文本 |
| uses_allowed | integer | 允许的最大使用次数 |
| uses_remaining | integer | 剩余可用次数 |
| expires_at | string|null | 过期时间（ISO 8601 格式，或 null 表示不过期） |
| created_by_admin_id | integer|null | 创建该邀请码的管理员 ID（可为 null） |
| assigned_to_user_id | integer|null | 如果该邀请码被指定给某位用户使用，填写该用户 ID，否则为 null |
| is_active | boolean | 当前邀请码是否仍然有效（true/false） |
| created_at | string | 创建时间（ISO 8601 格式） |
| member_level | string|null | 可选：此邀请码被使用后分配给新用户的会员级别（参见下方枚举），若无则为 null |

关于 `member_level`（前端期望的取值与含义）：

| 前端值 | 含义 (备注) |
|--------|-----------|
| emperor | emperor（最高级别） |
| private_director | private_director（私董 / 私人董事类权限） |
| core | core（核心会员） |
| normal | normal（普通会员） |

注意：前端不会自行映射这些值为本地名称（目前直接展示原始字符串或原样显示），如果后端希望前端显示更友好的中文名称，可以返回 `member_level_display` 字段，或者后端/前端达成一致的映射规则。

兼容性说明：
- 如果后端仍使用旧接口 `GET /api/team/{teamId}/invite-codes` 返回 `invite_codes` 数组，字段应与上表保持一致（字段名大小写也请保持一致，建议使用 snake_case）。
- 如果后端使用不同字段名（例如 `level` 或 `assign_level`），请告知前端以便同步修改。

---

## 后端接口补充说明（管理员 & 老师相关）

为了使前端可以在多个上下文中统一读取并展示 `member_level` 字段，后端请同时确认并支持以下接口：

1) 管理员创建邀请码（管理员在后台/管理端创建）

POST /api/admin/teams/<team_id>/invites

Request Body 示例:

```json
{
  "uses_allowed": 3,
  "assigned_to_user_id": null,
  "member_level": "core"
}
```

Response 示例（成功）:

```json
{
  "code": 0,
  "message": "邀请码生成成功",
  "invite": {
    "id": 101,
    "code": "ABC123",
    "team_id": 12,
    "uses_allowed": 3,
    "uses_remaining": 3,
    "created_by_admin_id": 1,
    "assigned_to_user_id": null,
    "is_active": true,
    "created_at": "2025-10-14T08:00:00",
    "expires_at": null,
    "member_level": "core"
  }
}
```

说明:
- `member_level` 为可选字段。如果请求中提供该字段且后端保存成功，则返回体中的 `invite.member_level` 应包含相同值。
- 若后端无法保存该字段，应在响应中返回 `member_level: null` 或不包含该字段，并在 API 文档/错误码中明确说明。

2) 团队详情（团队页面使用）

GET /api/teams/<team_id>

说明: 团队详情返回体中的 `invites` 数组（如果后端实现 embeds）应包含 `member_level` 字段（若数据库中存在）。前端会优先读取该字段来展示或决定新成员的初始等级。

示例（部分）:

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

3) 老师维度的邀请列表（用于个人邀请管理视图）

GET /api/teachers/<teacher_id>/invites

说明: 如果后端提供老师维度的邀请列表接口，请确保返回的 invite 项也包含 `member_level` 字段（若数据库中存在），以便前端在老师个人页面或历史记录中展示该信息。

示例响应:

```json
{
  "code": 0,
  "invites": [
    {
      "id": 55,
      "code": "XYZ789",
      "team_id": 12,
      "uses_allowed": 5,
      "uses_remaining": 4,
      "created_by_admin_id": null,
      "assigned_to_user_id": null,
      "is_active": true,
      "created_at": "2025-10-10T09:00:00",
      "expires_at": "2025-11-09T23:59:59",
      "member_level": "private_director"
    }
  ]
}
```

兼容性提醒:
- 前端在展示时优先使用 `GET /api/teams/<team_id>` 返回体中的 `invites`；作为后备，前端仍可调用 `GET /api/team/{teamId}/invite-codes`（旧接口）或 `GET /api/team/{teamId}/invite-codes` 返回的 `invite_codes`。请确保所有这些接口在可能的情况下返回一致的 `member_level` 字段。
- 字段命名建议使用 snake_case（例如 `member_level`），并保持各接口一致。

## 相关文档
- [用户信息实现文档](./user-profile-implementation.md)
- [头像上传实现文档](./avatar-upload-implementation.md)
- [Lanyard用户信息集成文档](./lanyard-user-info-integration.md)

## 更新日志

### 2025-10-13 - 重构为两层架构
 ✅ 实现权限差异(管理员看所有,老师看自己的)

### 2024-01-XX - 初始版本
- ✅ 创建团队设置页面(单页版)
- ✅ 实现团队信息管理功能
- ✅ 实现头像上传功能
- ✅ 实现邀请码生成功能
- ✅ 实现邀请码列表和复制功能
- ✅ 添加侧边栏权限控制
- ✅ 编写完整文档
