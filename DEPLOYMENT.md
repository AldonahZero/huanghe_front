# 生产环境部署指南

## 🚀 部署步骤

### 1. 构建生产版本

在服务器上执行以下命令:

```bash
# 安装依赖
pnpm install

# 构建生产版本(会自动使用 .env.production 中的配置)
pnpm build

# 启动生产服务器
pnpm start
```

### 2. 使用 PM2 管理进程(推荐)

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start pnpm --name "huanghe-front" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs huanghe-front

# 重启应用
pm2 restart huanghe-front

# 停止应用
pm2 stop huanghe-front
```

### 3. Nginx 配置示例

如果使用 Nginx 作为反向代理:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## ⚙️ 环境变量配置

### 生产环境 API 地址

文件: `.env.production`
```env
NEXT_PUBLIC_API_URL=http://115.190.102.236/api
```

### 本地开发 API 地址

文件: `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 🔧 常见问题

### Q1: 为什么生产环境还在请求 localhost?

**原因**: 没有正确配置环境变量或没有重新构建

**解决方案**:
1. 确认 `.env.production` 文件存在且配置正确
2. 删除 `.next` 文件夹: `rm -rf .next`
3. 重新构建: `pnpm build`
4. 重新启动: `pnpm start`

### Q2: 如何验证环境变量是否生效?

在构建后检查 `.next` 目录中的文件,或在浏览器控制台查看网络请求。

### Q3: 更新环境变量后需要重新构建吗?

**是的!** Next.js 在构建时会将环境变量编译到代码中,所以任何环境变量的修改都需要重新构建:

```bash
pnpm build
pm2 restart huanghe-front  # 如果使用 PM2
```

## 📝 部署检查清单

- [ ] `.env.production` 文件已正确配置
- [ ] 执行 `pnpm install` 安装依赖
- [ ] 执行 `pnpm build` 构建生产版本
- [ ] 检查构建过程中是否有错误
- [ ] 启动应用: `pnpm start` 或 `pm2 start`
- [ ] 在浏览器中测试,确认 API 请求指向正确的地址
- [ ] 配置防火墙规则(如需要)
- [ ] 配置 Nginx 反向代理(如需要)

## 🔄 更新部署

当有代码更新时:

```bash
# 拉取最新代码
git pull

# 安装新的依赖(如果有)
pnpm install

# 重新构建
pnpm build

# 重启应用
pm2 restart huanghe-front
```

## 🌐 API 地址说明

- **后端 API**: `http://115.190.102.236/api`
- **前端服务**: 默认运行在 `http://localhost:3000`
- **建议**: 使用 Nginx 将前端服务代理到 80 或 443 端口
