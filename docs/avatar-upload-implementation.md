# 头像上传功能实现指南

## 更新日期
2025年10月13日

## 功能概述
实现了基于 shadcn/ui 风格的头像上传组件,支持点击头像或按钮上传文件。

---

## 一、功能特性

### 1.1 交互方式
- ✅ 点击头像可触发文件选择
- ✅ 点击"上传头像"按钮触发文件选择
- ✅ 鼠标悬停头像时显示上传图标
- ✅ 选择文件后显示预览
- ✅ 可以删除已选择的文件

### 1.2 文件验证
- ✅ 支持格式: JPG、PNG、GIF、WebP
- ✅ 文件大小限制: 最大 5MB
- ✅ 前端实时验证,防止无效文件上传
- ✅ 显示文件名和大小

### 1.3 视觉反馈
- ✅ 头像有悬停效果(ring高亮)
- ✅ 上传图标遮罩层
- ✅ 删除按钮(X图标)
- ✅ 成功选择后显示绿色提示框
- ✅ 加载状态显示

---

## 二、UI 组件结构

### 2.1 组件层次
```
头像上传区域
├── 隐藏的文件输入 (input[type="file"])
├── 头像预览区域
│   ├── Avatar 组件
│   ├── 上传图标覆盖层 (悬停显示)
│   └── 删除按钮 (有预览时显示)
└── 说明和操作区域
    ├── 标题和描述
    ├── 上传按钮
    ├── 文件信息显示
    ├── 格式和大小说明
    └── 成功提示
```

### 2.2 样式特性
- **头像交互**: 
  - 编辑模式: `cursor-pointer` + `hover:ring-indigo-500`
  - 非编辑模式: 普通显示
  
- **上传覆盖层**:
  - 默认: 透明
  - 悬停: `bg-black bg-opacity-40` + 上传图标显示

- **删除按钮**:
  - 位置: 右上角 `-top-2 -right-2`
  - 样式: 红色圆形按钮 `bg-red-500`

---

## 三、代码实现

### 3.1 核心 State
```typescript
// 头像预览(Base64)
const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

// 选中的文件对象
const [avatarFile, setAvatarFile] = useState<File | null>(null);

// 上传中状态
const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

// 文件输入引用
const fileInputRef = useRef<HTMLInputElement>(null);
```

### 3.2 文件处理函数

#### 文件选择处理
```typescript
const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 1. 验证文件类型
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    setMessage({ type: "error", text: "只支持 JPG、PNG、GIF、WebP 格式的图片" });
    return;
  }

  // 2. 验证文件大小
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    setMessage({ type: "error", text: "图片大小不能超过 5MB" });
    return;
  }

  // 3. 创建预览
  const reader = new FileReader();
  reader.onloadend = () => {
    setAvatarPreview(reader.result as string);
    setAvatarFile(file);
    setMessage(null);
  };
  reader.readAsDataURL(file);
};
```

#### 点击头像上传
```typescript
const handleAvatarClick = () => {
  if (isEditing) {
    fileInputRef.current?.click();
  }
};
```

#### 移除选中的文件
```typescript
const handleRemoveAvatar = () => {
  setAvatarPreview(null);
  setAvatarFile(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
```

### 3.3 保存流程
```typescript
const handleSave = async () => {
  setIsSaving(true);
  
  // 1. 如果有新上传的头像,先上传文件
  if (avatarFile) {
    setIsUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatarToServer(avatarFile);
      updateData.avatar_url = avatarUrl;
    } catch (error) {
      // 处理上传失败
      return;
    }
    setIsUploadingAvatar(false);
  }

  // 2. 更新用户信息
  const response = await api.updateUserProfile(updateData);
  
  // 3. 清理状态
  setAvatarPreview(null);
  setAvatarFile(null);
  
  // 4. 更新本地存储
  localStorage.setItem("hh_user", JSON.stringify(response.profile));
};
```

---

## 四、后端集成 (待实现)

### 4.1 需要的后端接口

#### 文件上传接口
```
POST /api/user/avatar/upload
Content-Type: multipart/form-data

Request Body:
- avatar: File (图片文件)

Response:
{
  "url": "https://cdn.example.com/avatars/user123.jpg",
  "message": "头像上传成功"
}
```

### 4.2 前端集成步骤

#### Step 1: 添加上传API函数
在 `lib/api.ts` 中添加:

```typescript
export async function uploadAvatarFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("avatar", file);
  
  // 注意: FormData 不需要设置 Content-Type
  const response = await request<{ url: string }>(`/api/user/avatar/upload`, {
    method: "POST",
    body: formData,
    headers: {
      // 让浏览器自动设置 Content-Type: multipart/form-data
      // 不要手动设置,否则会缺少 boundary
    },
  });
  
  return response;
}
```

#### Step 2: 修改上传函数
在 `app/dashboard/account/page.tsx` 中修改:

```typescript
const uploadAvatarToServer = async (file: File): Promise<string> => {
  // 调用真实的上传API
  const response = await api.uploadAvatarFile(file);
  return response.url;
};
```

### 4.3 request 函数适配

需要确保 `lib/api.ts` 中的 `request` 函数支持 FormData:

```typescript
async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };

  // 只在非 FormData 时设置 Content-Type
  if (!(init.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  // ... 其余代码
}
```

---

## 五、临时方案 (当前实现)

由于后端文件上传接口尚未实现,当前使用临时方案:

```typescript
const uploadAvatarToServer = async (file: File): Promise<string> => {
  // 临时方案: 返回本地 Base64 预览
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};
```

**注意**: 
- ⚠️ 这只是临时方案,Base64 数据很大,不适合存储
- ⚠️ 刷新页面后图片会丢失(除非保存到localStorage)
- ✅ 后端接口实现后,替换为真实的上传逻辑

---

## 六、安全考虑

### 6.1 前端验证
- ✅ 文件类型白名单验证
- ✅ 文件大小限制(5MB)
- ✅ MIME类型检查

### 6.2 后端验证(建议)
- 🔹 再次验证文件类型和大小
- 🔹 检查文件内容(防止伪造MIME类型)
- 🔹 文件名随机化,防止覆盖
- 🔹 病毒扫描
- 🔹 图片压缩和优化
- 🔹 生成缩略图

### 6.3 存储建议
- 🔹 使用CDN存储图片
- 🔹 返回CDN URL而非服务器直接路径
- 🔹 设置合理的缓存策略
- 🔹 定期清理未使用的图片

---

## 七、优化建议

### 7.1 图片处理
```typescript
// 1. 客户端压缩(可选)
import imageCompression from 'browser-image-compression';

const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 压缩图片
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    // 使用压缩后的文件
    setAvatarFile(compressedFile);
  } catch (error) {
    console.error('压缩失败:', error);
  }
};
```

### 7.2 图片裁剪
可以集成图片裁剪库,如 `react-easy-crop`:

```bash
pnpm add react-easy-crop
```

### 7.3 上传进度
```typescript
const uploadAvatarToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("avatar", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      const response = JSON.parse(xhr.responseText);
      resolve(response.url);
    });

    xhr.addEventListener('error', () => {
      reject(new Error('上传失败'));
    });

    xhr.open('POST', `${API_BASE}/api/user/avatar/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};
```

---

## 八、测试要点

### 8.1 功能测试
- [ ] 点击头像能触发文件选择
- [ ] 点击"上传头像"按钮能触发文件选择
- [ ] 选择文件后显示预览
- [ ] 删除按钮能清除预览
- [ ] 保存后头像更新成功

### 8.2 验证测试
- [ ] 上传非图片文件显示错误
- [ ] 上传超大文件显示错误
- [ ] 上传不支持格式显示错误

### 8.3 交互测试
- [ ] 悬停头像显示上传图标
- [ ] 编辑模式下可以操作
- [ ] 非编辑模式下不可操作
- [ ] 取消编辑清除预览

### 8.4 边界测试
- [ ] 连续多次选择文件
- [ ] 选择后再次选择
- [ ] 网络错误处理
- [ ] 上传超时处理

---

## 九、相关文件

### 修改的文件
1. `/app/dashboard/account/page.tsx` - 添加文件上传逻辑
2. `/components/ui/button.tsx` - 添加 size 属性支持

### 依赖的库
1. `lucide-react` - 图标库(Upload, X)
2. `react` - useRef hook
3. `FileReader API` - 文件预览

---

## 十、后续工作

### 10.1 必须完成
- [ ] 实现后端文件上传接口
- [ ] 集成真实的上传API
- [ ] 添加上传进度显示

### 10.2 可选优化
- [ ] 添加图片裁剪功能
- [ ] 客户端图片压缩
- [ ] 拖拽上传支持
- [ ] 粘贴上传支持
- [ ] 多种尺寸生成

---

## 十一、常见问题

### Q1: 为什么不直接存储 Base64?
A: Base64 编码会使文件大小增加约 33%,不适合数据库存储。应该上传到文件服务器或 CDN,只存储 URL。

### Q2: 如何处理上传失败?
A: 使用 try-catch 捕获错误,显示友好的错误消息,不影响其他字段的保存。

### Q3: 可以支持多文件上传吗?
A: 可以,将 `<input>` 添加 `multiple` 属性,并修改处理逻辑。

### Q4: 如何实现头像编辑(旋转、缩放)?
A: 可以集成 `react-avatar-editor` 或 `react-easy-crop` 等库。

---

## 十二、参考资源

- [MDN FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Lucide React Icons](https://lucide.dev/)
- [shadcn/ui Avatar](https://ui.shadcn.com/docs/components/avatar)
