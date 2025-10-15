"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MonitoredItemsGrid from "@/components/MonitoredItemsGrid";
import CreateProjectModal from "@/components/CreateProjectModal";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 检查是否是管理员或老师
  const canCreateProject = user?.role === "admin" || user?.role === "teacher";

  const handleProjectCreated = () => {
    setShowCreateModal(false);
    setRefreshKey((prev) => prev + 1); // 触发刷新
  };

  return (
    <main className="p-6 dashboard-main">
      {/* 顶部标题栏 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">监控饰品</h2>

        {canCreateProject && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>新建监控</span>
          </button>
        )}
      </div>

      {/* 主内容区域 - 左侧面板 + 右侧卡片网格 */}
      <div className="flex gap-6">
        {/* 左侧装饰面板 */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          {/* 用户信息卡片 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {user?.username || "用户"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role === "admin"
                    ? "管理员"
                    : user?.role === "teacher"
                    ? "老师"
                    : "学生"}
                </div>
              </div>
            </div>
          </div>

          {/* 快速统计卡片 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              快速统计
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">活跃项目</span>
                <span className="text-lg font-bold text-green-600">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">暂停项目</span>
                <span className="text-lg font-bold text-orange-600">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总计</span>
                <span className="text-lg font-bold text-blue-600">-</span>
              </div>
            </div>
          </div>

          {/* 提示信息卡片 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-sm border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  使用提示
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  点击卡片查看详情，使用底部按钮管理项目。
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* 右侧卡片网格区域 */}
        <div className="flex-1 min-w-0">
          <MonitoredItemsGrid key={refreshKey} />
        </div>
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </main>
  );
}
