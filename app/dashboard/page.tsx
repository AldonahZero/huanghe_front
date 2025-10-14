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

      <MonitoredItemsGrid key={refreshKey} />

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </main>
  );
}
