#!/bin/bash

# 🔧 开发模式快速启动脚本

echo "======================================"
echo "🔧 启用开发模式"
echo "======================================"
echo ""

# 检查 .env.local 是否存在
if [ ! -f ".env.local" ]; then
    echo "📝 创建 .env.local 文件..."
    cat > .env.local << EOF
# 本地开发环境 API 地址
NEXT_PUBLIC_API_URL=http://localhost:5001

# 开发模式 - 跳过登录验证 (生产环境请设置为 false)
NEXT_PUBLIC_DEV_MODE=true
EOF
    echo "✅ .env.local 已创建"
else
    # 检查是否已有 NEXT_PUBLIC_DEV_MODE
    if grep -q "NEXT_PUBLIC_DEV_MODE" .env.local; then
        # 更新为 true
        sed -i.bak 's/NEXT_PUBLIC_DEV_MODE=.*/NEXT_PUBLIC_DEV_MODE=true/' .env.local
        echo "✅ 已将 NEXT_PUBLIC_DEV_MODE 设置为 true"
    else
        # 添加配置
        echo "" >> .env.local
        echo "# 开发模式 - 跳过登录验证 (生产环境请设置为 false)" >> .env.local
        echo "NEXT_PUBLIC_DEV_MODE=true" >> .env.local
        echo "✅ 已添加 NEXT_PUBLIC_DEV_MODE=true"
    fi
fi

echo ""
echo "📋 当前配置:"
cat .env.local
echo ""

echo "======================================"
echo "✨ 开发模式已启用!"
echo "======================================"
echo ""
echo "现在你可以:"
echo "  1. 启动开发服务器: pnpm dev"
echo "  2. 直接访问所有页面,无需登录"
echo "  3. 使用模拟管理员用户进行开发"
echo ""
echo "💡 提示:"
echo "  - 在浏览器控制台会看到: 🔧 开发模式已启用"
echo "  - 适合 UI 调试和快速开发"
echo "  - 测试登录功能时请关闭开发模式"
echo ""
echo "📚 更多信息: 查看 DEV_MODE_GUIDE.md"
echo ""
