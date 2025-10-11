"use client";

import { usePathname } from "next/navigation";

export default function DashboardTopbar() {
  const pathname = usePathname();
  const mapTitle: Record<string, string> = {
    "/dashboard": "概览",
    "/dashboard/listings": "监控列表",
    "/dashboard/settings": "设置",
  };
  const title = mapTitle[pathname || "/dashboard"] || "页面";

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
        <div className="text-sm text-gray-600">管理员</div>
      </div>
    </header>
  );
}
