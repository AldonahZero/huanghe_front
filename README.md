This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 环境配置

### API 地址配置

项目使用环境变量来配置后端 API 地址:

1. **开发环境**: 复制 `.env.example` 为 `.env.local`
   ```bash
   cp .env.example .env.local
   ```

2. **生产环境**: 使用 `.env.production` (已配置)
   - API 地址: `http://115.190.102.236/api`

3. **环境变量说明**:
   - `NEXT_PUBLIC_API_URL`: 后端 API 基础 URL
     - 开发环境默认: `http://localhost:5001`
     - 生产环境: `http://115.190.102.236/api`
   - `NEXT_PUBLIC_DEV_MODE`: 开发模式开关
     - `true`: 跳过登录验证,使用模拟用户
     - `false`: 使用真实登录(生产环境必须为 false)

### 🔧 开发模式 (推荐用于 UI 调试)

启用开发模式可以跳过登录,直接访问所有页面:

```bash
# 在 .env.local 中添加
NEXT_PUBLIC_DEV_MODE=true

# 重启开发服务器
pnpm dev
```

启用后:
- ✅ 无需登录即可访问 Dashboard 等所有页面
- ✅ 自动使用管理员权限的模拟用户
- ✅ 加速 UI 开发和调试

详细说明请查看 [开发模式使用指南](./DEV_MODE_GUIDE.md)

### 部署到生产环境

构建生产版本时,Next.js 会自动使用 `.env.production` 中的配置:

```bash
pnpm build
pnpm start
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
