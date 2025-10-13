# 团队设置功能实现文档

## 概述
团队设置功能允许管理员和教师管理团队信息、上传团队头像、生成和管理团队邀请码。

## 权限模型
- **访问权限**: 仅限 `admin` 和 `teacher` 角色
- **普通成员**: 无法访问团队设置页面
- **权限检查位置**:
  - 前端: `app/dashboard/team/page.tsx` 中使用 `useAuth()` 检查
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

#### 获取团队信息
```typescript
GET /api/team/info

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
PUT /api/team/info

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
POST /api/team/invite-code

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
GET /api/team/invite-codes

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

#### 主页面组件
**文件**: `app/dashboard/team/page.tsx`

**状态管理**:
- `teamInfo`: 团队信息
- `formData`: 编辑表单数据
- `avatarPreview`: 头像预览
- `inviteCodes`: 邀请码列表
- `inviteForm`: 邀请码生成表单
- `isEditing`: 编辑模式开关
- `message`: 消息提示

**核心功能函数**:
- `loadTeamInfo()`: 加载团队信息
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

#### 顶栏标题
**文件**: `components/DashboardTopbar.tsx`

**标题映射**:
```typescript
const mapTitle: Record<string, string> = {
  // ...
  "/dashboard/team": "团队设置",
  // ...
};
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

#### 编辑团队信息
1. 用户点击"编辑信息"按钮
2. 输入框变为可编辑状态
3. 用户修改信息(可选上传头像)
4. 点击"保存更改"
5. 显示成功/失败消息
6. 自动退出编辑模式

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
- [ ] 管理员可以访问团队设置页面
- [ ] 教师可以访问团队设置页面
- [ ] 普通成员无法访问团队设置页面
- [ ] 团队信息加载正常
- [ ] 团队信息编辑和保存功能正常
- [ ] 头像上传(文件选择、预览、删除)正常
- [ ] 邀请码生成功能正常
- [ ] 邀请码列表加载正常
- [ ] 邀请码复制功能正常
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

## 相关文档
- [用户信息实现文档](./user-profile-implementation.md)
- [头像上传实现文档](./avatar-upload-implementation.md)
- [Lanyard用户信息集成文档](./lanyard-user-info-integration.md)

## 更新日志

### 2024-01-XX
- ✅ 创建团队设置页面
- ✅ 实现团队信息管理功能
- ✅ 实现头像上传功能
- ✅ 实现邀请码生成功能
- ✅ 实现邀请码列表和复制功能
- ✅ 添加侧边栏权限控制
- ✅ 更新顶栏标题映射
- ✅ 编写完整文档
