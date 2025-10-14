"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function DashboardTopbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 页面标题映射
  const mapTitle: Record<string, string> = {
    "/dashboard": "仪表盘",
    "/dashboard/profile": "团队信息",
    "/dashboard/account": "个人信息",
    "/dashboard/teams": "团队管理",
    "/dashboard/listings": "监控列表",
    "/dashboard/settings": "系统设置",
  };

  // 处理动态路由（如项目详情页、团队详情页）
  let title = mapTitle[pathname || "/dashboard"];

  if (!title) {
    if (pathname?.startsWith("/dashboard/project/")) {
      title = "项目详情";
    } else if (pathname?.startsWith("/dashboard/teams/")) {
      title = "团队设置";
    } else {
      title = "仪表盘";
    }
  }

  return (
    <header className="relative h-16 flex items-center justify-between px-6 bg-white/70 backdrop-blur border-b">
      {/* Left controls */}
      <div className="flex items-center gap-4 z-30">
        <button className="p-2 rounded hover:bg-gray-100">☰</button>
        {/* keep a small label for accessibility */}
        <span className="sr-only">Open sidebar</span>
      </div>

      {/* Centered page title + icon (non-interactive) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 flex items-center justify-center z-20">
        <div className="flex items-center gap-3">
          <img src="/logo.ico" alt="logo" className="h-6 w-6 object-contain" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 z-30">
        <Link
          href="/dashboard/account"
          className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.avatar_url || undefined}
              alt={user?.user_nickname || user?.username}
            />
            <AvatarFallback>
              {(user?.user_nickname || user?.username || "U")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <div className="text-sm font-medium text-gray-900">
              {user?.user_nickname || user?.username || "用户"}
            </div>
            <div className="text-xs text-gray-500">
              {user?.role === "admin"
                ? "管理员"
                : user?.role === "teacher"
                ? "老师"
                : user?.role === "leader"
                ? "团队长"
                : "成员"}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
