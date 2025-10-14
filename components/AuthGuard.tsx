"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // 如果当前路径是公开路径, 不做任何事情
      if (
        PUBLIC_PATHS.some(
          (p) => pathname === p || pathname?.startsWith(p + "/")
        )
      ) {
        return;
      }
      // 立即跳转到登录并保留 next（使用 replace 防止回退堆栈问题）
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
    }
  }, [loading, user, pathname, router]);

  // 立即重定向的实现不会渲染提示条，这里直接渲染 children（当 replace 已执行时，会导航离开）

  // 若 loading 或者已登录，直接渲染子组件
  return <>{children}</>;
}
