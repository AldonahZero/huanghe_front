#!/bin/bash

# 🔒 关闭开发模式脚本

echo "======================================"
echo "🔒 关闭开发模式"
echo "======================================"
echo ""

if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 文件不存在"
    exit 0
fi

# 检查是否有 NEXT_PUBLIC_DEV_MODE
if grep -q "NEXT_PUBLIC_DEV_MODE" .env.local; then
    # 设置为 false
    sed -i.bak 's/NEXT_PUBLIC_DEV_MODE=.*/NEXT_PUBLIC_DEV_MODE=false/' .env.local
    echo "✅ 已将 NEXT_PUBLIC_DEV_MODE 设置为 false"
else
    echo "ℹ️  配置文件中没有 NEXT_PUBLIC_DEV_MODE"
fi

echo ""
echo "📋 当前配置:"
cat .env.local
echo ""

echo "======================================"
echo "✨ 开发模式已关闭!"
echo "======================================"
echo ""
echo "现在你可以:"
echo "  1. 重启开发服务器: pnpm dev"
echo "  2. 使用真实登录流程"
echo "  3. 测试认证相关功能"
echo ""
echo "💡 提示:"
echo "  - 需要重启开发服务器才能生效"
echo "  - 访问 /dashboard 会跳转到 /login"
echo ""
